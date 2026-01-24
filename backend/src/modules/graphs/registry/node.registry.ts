import { Injectable, Logger } from '@nestjs/common';
import { LLMService } from '../services/llm.service';
import { MCPClientService } from '../services/mcp-client.service';
import { UserToolAuthService } from '@/modules/mcp/services/mcp-auth.service';
import {
  WorkflowState,
  Message,
  ToolDefinition,
} from '../types/langraph.types';
import {
  LLMNodeData,
  MCPToolNodeData,
  AgentNodeData,
} from '../types/graph.types';

const MAX_AGENT_ITERATIONS = 10;

/**
 * Normalize MCP server name to database key format
 * e.g., 'google-docs' → 'google_docs'
 */
const normalizeToolKey = (serverName: string): string => {
  return serverName.replace(/-/g, '_');
};

@Injectable()
export class NodeRegistry {
  private readonly logger = new Logger(NodeRegistry.name);

  constructor(
    private readonly llmService: LLMService,
    private readonly mcpClient: MCPClientService,
    private readonly userToolAuthService: UserToolAuthService,
  ) {}

  createLLMNode(nodeData: LLMNodeData, userId: string) {
    return async (state: WorkflowState): Promise<Partial<WorkflowState>> => {
      this.logger.debug(
        `LLM Node executing: ${nodeData.provider}/${nodeData.model}`,
      );

      const finalPrompt = this.interpolateTemplate(nodeData.userPrompt, state);
      this.logger.debug(
        `LLM Node prompt: "${finalPrompt.substring(0, 100)}..."`,
      );

      try {
        const output = await this.llmService.call({
          provider: nodeData.provider,
          model: nodeData.model,
          prompt: finalPrompt,
          systemPrompt: nodeData.systemPrompt,
          temperature: nodeData.temperature,
          maxTokens: nodeData.maxTokens,
          userId,
        });

        this.logger.debug(`LLM Node output: "${output?.substring(0, 100)}..."`);

        return {
          output,
          messages: [
            ...state.messages,
            { role: 'user', content: finalPrompt },
            { role: 'assistant', content: output },
          ],
        };
      } catch (error) {
        this.logger.error(`LLM Node error: ${error}`);
        return {
          output: `Error: ${error}`,
          error: `${error}`,
        };
      }
    };
  }

  createMCPToolNode(nodeData: MCPToolNodeData, userId: string) {
    return async (state: WorkflowState): Promise<Partial<WorkflowState>> => {
      this.logger.debug(
        `MCP Tool Node: ${nodeData.mcpServer}/${nodeData.toolName}`,
      );

      const args = this.interpolateArgs(nodeData.toolArgs, state);

      // Add accessToken if the server requires auth
      let finalArgs = args;
      if (this.mcpClient.requiresAuth(nodeData.mcpServer)) {
        try {
          const accessToken = await this.userToolAuthService.getAccessToken({
            userId,
            toolKey: normalizeToolKey(nodeData.mcpServer),
          });
          finalArgs = { ...args, accessToken };
        } catch (error) {
          this.logger.error(`Failed to get access token: ${error}`);
          return {
            error: `Authentication required for ${nodeData.mcpServer}. Please connect your Google account.`,
          };
        }
      }

      try {
        const result = await this.mcpClient.callTool(
          nodeData.mcpServer,
          nodeData.toolName,
          finalArgs,
        );

        const output =
          typeof result === 'string' ? result : JSON.stringify(result, null, 2);

        return {
          output,
          context: { ...state.context, toolResult: result },
        };
      } catch (error) {
        this.logger.error(`MCP Tool failed: ${error}`);
        return {
          error: `Tool ${nodeData.toolName} failed: ${error}`,
        };
      }
    };
  }

  createAgentNode(nodeData: AgentNodeData, userId: string) {
    return async (state: WorkflowState): Promise<Partial<WorkflowState>> => {
      this.logger.debug(
        `Agent Node starting: ${nodeData.provider}/${nodeData.model}`,
      );

      const maxIterations = nodeData.maxIterations ?? MAX_AGENT_ITERATIONS;

      /**
       * 1. Get tools + preload auth
       */
      let tools: ToolDefinition[] = [];
      const toolAuthContext: Record<string, { accessToken?: string }> = {};

      try {
        const rawTools = await this.mcpClient.getToolsFromServers(
          nodeData.mcpServers,
        );

        // Preload access token for auth-required MCP servers
        for (const server of nodeData.mcpServers) {
          if (this.mcpClient.requiresAuth(server)) {
            try {
              const accessToken = await this.userToolAuthService.getAccessToken(
                {
                  userId,
                  toolKey: normalizeToolKey(server),
                },
              );

              toolAuthContext[server] = { accessToken };
              this.logger.debug(`Preloaded access token for ${server}`);
            } catch (e) {
              this.logger.warn(
                `Auth missing for ${server}, its tools will be disabled`,
              );
              toolAuthContext[server] = {};
            }
          }
        }

        // Filter tools: only allow authenticated tools
        tools = rawTools.filter((tool) => {
          if (!tool.mcpServer) return true;
          if (!this.mcpClient.requiresAuth(tool.mcpServer)) return true;
          return Boolean(toolAuthContext[tool.mcpServer]?.accessToken);
        });

        this.logger.debug(
          `Agent has access to ${tools.length} tools after auth filtering`,
        );
      } catch (error) {
        this.logger.error(`Failed to get tools from MCP servers: ${error}`);
        return {
          output: `Error: Failed to connect to MCP servers. ${error}`,
          error: `${error}`,
        };
      }

      /**
       * 2. Init messages
       */
      const messages: Message[] = [...state.messages];

      // Determine the prompt to use
      if (nodeData.userPrompt) {
        // Option A: Specific user prompt configured
        let promptTemplate = nodeData.userPrompt;

        if (
          state.messages.length === 0 &&
          !promptTemplate.includes('{{input}}')
        ) {
          promptTemplate += '\n\ninput: {{input}}';
        }

        const prompt = this.interpolateTemplate(promptTemplate, state);
        messages.push({ role: 'user', content: prompt });
        this.logger.debug(
          `Agent Node userPrompt: "${prompt.substring(0, 50)}..."`,
        );
      } else {
        // Option B: No specific prompt, use existing state input (backward compatibility)
        // Only add state.input if it's the start of a conversation (messages empty)

        if (state.messages.length === 0) {
          // First node, or no history. Must rely on input.
          messages.push({ role: 'user', content: state.input });
        } else {
          // Chain mode: Rely on conversation history (e.g. previous agent's output).
          // Do not re-inject state.input unless necessary.
          this.logger.debug(
            'Agent Node reusing conversation history (no new user prompt)',
          );
        }
      }

      /**
       * 3. Build system prompt with auth context
       */
      const authStatus = Object.entries(toolAuthContext)
        .map(([server, ctx]) =>
          ctx.accessToken
            ? `- ${server}: authenticated`
            : `- ${server}: NOT authenticated`,
        )
        .join('\n');

      const systemPrompt = `
        ${nodeData.systemPrompt ?? ''}

        Tool authentication status:
        ${authStatus}

        Rules:
          - Some tools require authentication (especially tools starting with google (except for google search), slack, trello, github...), some do not. 
          - Only call authenticated tools if they require authentication.
          - You may freely call tools that do NOT require authentication.
          - Never attempt to call a tool that requires authentication but is marked as NOT authenticated.
      `.trim();

      /**
       * 4. Agentic Loop - Continue until no tool calls or max iterations reached
       */
      let iteration = 0;
      let finalOutput = '';

      while (iteration < maxIterations) {
        iteration++;
        this.logger.debug(`Agent iteration ${iteration}/${maxIterations}`);

        let response;
        try {
          response = await this.llmService.callWithTools({
            provider: nodeData.provider,
            model: nodeData.model,
            messages,
            tools,
            systemPrompt,
            userId,
          });

          this.logger.debug(`Agent LLM response: ${JSON.stringify(response)}`);
        } catch (error) {
          this.logger.error(`Agent LLM call failed: ${error}`);
          return {
            output: `Error: LLM call failed. ${error}`,
            error: `${error}`,
            messages,
          };
        }

        /**
         * If no tool calls, LLM is done - return the final response
         */
        if (!response.toolCalls || response.toolCalls.length === 0) {
          this.logger.debug(
            `Agent finished after ${iteration} iteration(s) - no more tool calls`,
          );
          messages.push({ role: 'assistant', content: response.content });
          return {
            output: response.content,
            messages,
          };
        }

        /**
         * Add assistant message (tool intent)
         */
        messages.push({
          role: 'assistant',
          content:
            response.content ||
            `Calling ${response.toolCalls.length} tool(s)...`,
          toolCalls: response.toolCalls,
        });

        /**
         * Execute all requested tools in this iteration
         */
        for (const toolCall of response.toolCalls) {
          this.logger.debug(
            `Agent executing tool: ${toolCall.mcpServer}/${toolCall.name}`,
          );

          try {
            let toolArgs = toolCall.args;

            const auth = toolAuthContext[toolCall.mcpServer!];
            if (auth?.accessToken) {
              toolArgs = { ...toolArgs, accessToken: auth.accessToken };
            }

            this.logger.debug(`Tool args: ${JSON.stringify(toolArgs)}`);

            const toolResult = await this.mcpClient.callTool(
              toolCall.mcpServer!,
              toolCall.name,
              toolArgs,
            );

            this.logger.debug(`Tool result: ${JSON.stringify(toolResult)}`);

            let resultContent: string;
            if (toolResult == null) {
              resultContent = 'Tool returned no result.';
            } else if (typeof toolResult === 'string') {
              resultContent = toolResult || 'Tool returned empty string.';
            } else if (
              typeof toolResult === 'object' &&
              Array.isArray((toolResult as any).content)
            ) {
              resultContent = (toolResult as any).content
                .map((c: any) => c.text || JSON.stringify(c))
                .join('\n');
            } else {
              resultContent = JSON.stringify(toolResult, null, 2);
            }

            messages.push({
              role: 'tool',
              content: resultContent,
              toolCallId: toolCall.name,
              name: toolCall.name,
            });

            finalOutput += `[${toolCall.name}]: ${resultContent}\n\n`;
          } catch (error) {
            this.logger.error(`Tool ${toolCall.name} failed: ${error}`);
            const errorContent = `Error executing tool ${toolCall.name}: ${error}`;
            messages.push({
              role: 'tool',
              content: errorContent,
              toolCallId: toolCall.name,
              name: toolCall.name,
            });
            finalOutput += `[${toolCall.name}]: ${errorContent}\n\n`;
          }
        }

        // Continue loop - LLM will be called again with tool results
      }

      /**
       * Max iterations reached
       */
      this.logger.warn(`Agent reached max iterations (${maxIterations})`);
      messages.push({
        role: 'assistant',
        content: `Reached maximum iterations (${maxIterations}). Stopping agent loop.`,
      });

      return {
        output:
          finalOutput.trim() ||
          `Agent stopped after ${maxIterations} iterations.`,
        messages,
      };
    };
  }

  llm() {
    return async (state: WorkflowState): Promise<Partial<WorkflowState>> => {
      const prompt = state.input?.trim() || 'Hello';

      const output = await this.llmService.call({
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        prompt,
      });

      return {
        output,
      };
    };
  }

  evaluator() {
    return async (state: WorkflowState): Promise<Partial<WorkflowState>> => {
      const ok = Boolean(state.output && state.output.length > 50);

      return {
        ok,
        retryCount: ok ? 0 : 1,
      };
    };
  }

  private interpolateTemplate(template: string, state: WorkflowState): string {
    return template
      .replace(/\{\{input\}\}/g, state.input || '')
      .replace(/\{\{output\}\}/g, state.output || '')
      .replace(/\{\{context\.(\w+)\}\}/g, (_, key) => {
        const value = state.context?.[key];
        return typeof value === 'string' ? value : JSON.stringify(value ?? '');
      });
  }

  private interpolateArgs(
    args: Record<string, any>,
    state: WorkflowState,
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string') {
        result[key] = this.interpolateTemplate(value, state);
      } else if (Array.isArray(value)) {
        result[key] = value.map((v) =>
          typeof v === 'string' ? this.interpolateTemplate(v, state) : v,
        );
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateArgs(value, state);
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}
