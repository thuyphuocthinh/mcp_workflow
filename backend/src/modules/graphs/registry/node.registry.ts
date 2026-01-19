import { Injectable, Logger } from '@nestjs/common';
import { LLMService } from '../services/llm.service';
import { MCPClientService } from '../services/mcp-client.service';
import { UserToolAuthService } from '@/modules/mcp/services/mcp-auth.service';
import { WorkflowState, Message, ToolDefinition } from '../types/langraph.types';
import {
  LLMNodeData,
  MCPToolNodeData,
  AgentNodeData,
} from '../types/graph.types';

const MAX_AGENT_ITERATIONS = 10;

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
      this.logger.debug(`LLM Node executing: ${nodeData.provider}/${nodeData.model}`);

      const finalPrompt = this.interpolateTemplate(nodeData.userPrompt, state);
      this.logger.debug(`LLM Node prompt: "${finalPrompt.substring(0, 100)}..."`);

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
      this.logger.debug(`MCP Tool Node: ${nodeData.mcpServer}/${nodeData.toolName}`);

      const args = this.interpolateArgs(nodeData.toolArgs, state);

      // Add accessToken if the server requires auth
      let finalArgs = args;
      if (this.mcpClient.requiresAuth(nodeData.mcpServer)) {
        try {
          const accessToken = await this.userToolAuthService.getAccessToken({
            userId,
            toolKey: nodeData.mcpServer,
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

        const output = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

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
      const maxIterations = nodeData.maxIterations ?? MAX_AGENT_ITERATIONS;
      this.logger.debug(`Agent Node starting: ${nodeData.provider}/${nodeData.model}, max ${maxIterations} iterations`);

      // 1. Get available tools from MCP servers
      let tools: ToolDefinition[] = [];
      try {
        tools = await this.mcpClient.getToolsFromServers(nodeData.mcpServers);
        this.logger.debug(`Agent has access to ${tools.length} tools from ${nodeData.mcpServers.join(', ')}`);
        this.logger.debug(`Tools: ${JSON.stringify(tools)}`);
      } catch (error) {
        this.logger.error(`Failed to get tools from MCP servers: ${error}`);
        return {
          output: `Error: Failed to connect to MCP servers. ${error}`,
          error: `${error}`,
        };
      }

      // 2. Initialize conversation
      const messages: Message[] = [
        ...state.messages,
        { role: 'user', content: state.input },
      ];

      // 3. ReAct loop
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        this.logger.debug(`Agent iteration ${iteration + 1}/${maxIterations}`);

        // Call LLM with tools
        let response;
        try {
          response = await this.llmService.callWithTools({
            provider: nodeData.provider,
            model: nodeData.model,
            messages,
            tools,
            systemPrompt: nodeData.systemPrompt,
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

        // If no tool calls, we're done
        if (!response.toolCalls || response.toolCalls.length === 0) {
          this.logger.debug('Agent finished - no more tool calls');
          
          messages.push({ role: 'assistant', content: response.content });

          return {
            output: response.content,
            messages,
          };
        }

        // Add assistant message (with tool call intent)
        messages.push({
          role: 'assistant',
          content: response.content || `Calling ${response.toolCalls.length} tool(s)...`,
          toolCalls: response.toolCalls,  // Store tool calls for proper Gemini formatting
        });

        // Execute each tool call
        for (const toolCall of response.toolCalls) {
          this.logger.debug(`Agent executing tool: ${toolCall.mcpServer}/${toolCall.name}`);

          try {
            // Add accessToken if needed
            let toolArgs = toolCall.args;

            this.logger.debug(`Tool args: ${JSON.stringify(toolArgs)}`);

            if (toolCall.mcpServer && this.mcpClient.requiresAuth(toolCall.mcpServer)) {
              try {
                const accessToken = await this.userToolAuthService.getAccessToken({
                  userId,
                  toolKey: toolCall.mcpServer,
                });
                toolArgs = { ...toolArgs, accessToken };
              } catch (authError) {
                this.logger.warn(`Auth failed for ${toolCall.mcpServer}: ${authError}`);
                messages.push({
                  role: 'tool',
                  content: `Error: Authentication required for ${toolCall.mcpServer}. Please connect your account first.`,
                  toolCallId: toolCall.name,
                  name: toolCall.name,
                });
                continue; // Skip this tool, let LLM handle the error
              }
            }

            const toolResult = await this.mcpClient.callTool(
              toolCall.mcpServer!,
              toolCall.name,
              toolArgs,
            );

            this.logger.debug(`Tool result: ${JSON.stringify(toolResult)}`);

            // Handle null/undefined/empty results
            let resultContent: string;
            if (toolResult === null || toolResult === undefined) {
              resultContent = 'Tool returned no result.';
            } else if (typeof toolResult === 'string') {
              resultContent = toolResult || 'Tool returned empty string.';
            } else if (typeof toolResult === 'object') {
              // Check for MCP content format
              if (toolResult.content && Array.isArray(toolResult.content)) {
                resultContent = toolResult.content
                  .map((c: any) => c.text || JSON.stringify(c))
                  .join('\n');
              } else {
                resultContent = JSON.stringify(toolResult, null, 2);
              }
            } else {
              resultContent = String(toolResult);
            }

            messages.push({
              role: 'tool',
              content: resultContent,
              toolCallId: toolCall.name,
              name: toolCall.name,
            });
          } catch (error) {
            this.logger.error(`Tool ${toolCall.name} failed: ${error}`);
            messages.push({
              role: 'tool',
              content: `Error executing tool ${toolCall.name}: ${error}`,
              toolCallId: toolCall.name,
              name: toolCall.name,
            });
          }
        }
      }

      // Max iterations reached
      this.logger.warn('Agent reached max iterations');
      return {
        output: 'Agent reached maximum iterations without completing.',
        error: 'MAX_ITERATIONS_REACHED',
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
