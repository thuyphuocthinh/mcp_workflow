import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {
  Message,
  ToolDefinition,
  LLMToolResponse,
  ToolCall,
} from '../types/langraph.types';
import { LLMProvider } from '../types/graph.types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface LLMCallOptions {
  provider: LLMProvider;
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMCallWithToolsOptions {
  provider: LLMProvider;
  model: string;
  messages: Message[];
  tools: ToolDefinition[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private geminiClient: GoogleGenAI | null = null;
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeClients();
  }

  private initializeClients() {
    // Initialize Gemini (using GOOGLE_API_KEY or GEMINI_API_KEY)
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY') 
      || this.configService.get<string>('GOOGLE_API_KEY');
    if (geminiKey) {
      this.geminiClient = new GoogleGenAI({ apiKey: geminiKey });
      this.logger.log('Gemini client initialized');
    }

    // Initialize OpenAI
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openaiKey) {
      this.openaiClient = new OpenAI({ apiKey: openaiKey });
      this.logger.log('OpenAI client initialized');
    }

    // Initialize Anthropic
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      this.anthropicClient = new Anthropic({ apiKey: anthropicKey });
      this.logger.log('Anthropic client initialized');
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Public: Simple call (prompt → response)
  // ─────────────────────────────────────────────────────────────

  async call(options: LLMCallOptions): Promise<string> {
    const { provider, model, prompt, systemPrompt, temperature, maxTokens } =
      options;

    this.logger.debug(`LLM call: ${provider}/${model}`);

    switch (provider) {
      case 'gemini':
        return this.callGemini(model, prompt, systemPrompt, temperature, maxTokens);
      case 'openai':
        return this.callOpenAI(model, prompt, systemPrompt, temperature, maxTokens);
      case 'anthropic':
        return this.callAnthropic(model, prompt, systemPrompt, temperature, maxTokens);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Public: Call with tools (for agents)
  // ─────────────────────────────────────────────────────────────

  async callWithTools(options: LLMCallWithToolsOptions): Promise<LLMToolResponse> {
    const { provider, model, messages, tools, systemPrompt, temperature, maxTokens } =
      options;

    this.logger.debug(`LLM call with tools: ${provider}/${model}, ${tools.length} tools`);

    switch (provider) {
      case 'gemini':
        return this.callGeminiWithTools(model, messages, tools, systemPrompt, temperature, maxTokens);
      case 'openai':
        return this.callOpenAIWithTools(model, messages, tools, systemPrompt, temperature, maxTokens);
      case 'anthropic':
        return this.callAnthropicWithTools(model, messages, tools, systemPrompt, temperature, maxTokens);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Private: Gemini
  // ─────────────────────────────────────────────────────────────

  private async callGemini(
    model: string,
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized. Check GEMINI_API_KEY.');
    }

    const result = await this.geminiClient.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens: maxTokens,
      },
    });

    return result.text ?? '';
  }

  private async callGeminiWithTools(
    model: string,
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<LLMToolResponse> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized. Check GEMINI_API_KEY.');
    }

    const geminiTools: any[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Build request config
    const requestConfig: any = {
      model,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens: maxTokens,
      },
    };

    // Only add tools if we have any
    if (geminiTools.length > 0) {
      requestConfig.tools = [{ functionDeclarations: geminiTools }];
    }

    const result = await this.geminiClient.models.generateContent(requestConfig);

    // Parse function calls from response
    const functionCalls: ToolCall[] = [];
    const parts = result.candidates?.[0]?.content?.parts || [];
    
    for (const part of parts) {
      if (part.functionCall && part.functionCall.name) {
        const fnName = part.functionCall.name;
        functionCalls.push({
          name: fnName,
          args: (part.functionCall.args || {}) as Record<string, any>,
          mcpServer: tools.find((t) => t.name === fnName)?.mcpServer,
        });
      }
    }

    return {
      content: result.text ?? '',
      toolCalls: functionCalls,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Private: OpenAI
  // ─────────────────────────────────────────────────────────────

  private async callOpenAI(
    model: string,
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<string> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await this.openaiClient.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content ?? '';
  }

  private async callOpenAIWithTools(
    model: string,
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<LLMToolResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      openaiMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const m of messages) {
      if (m.role === 'user') {
        openaiMessages.push({ role: 'user', content: m.content });
      } else if (m.role === 'assistant') {
        openaiMessages.push({ role: 'assistant', content: m.content });
      } else if (m.role === 'tool') {
        openaiMessages.push({
          role: 'tool',
          content: m.content,
          tool_call_id: m.toolCallId || 'unknown',
        });
      }
    }

    const openaiTools: OpenAI.ChatCompletionTool[] = tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));

    const response = await this.openaiClient.chat.completions.create({
      model,
      messages: openaiMessages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
      temperature,
      max_tokens: maxTokens,
    });

    const message = response.choices[0]?.message;
    const toolCalls: ToolCall[] = [];
    
    if (message?.tool_calls) {
      for (const tc of message.tool_calls) {
        if (tc.type === 'function') {
          toolCalls.push({
            name: tc.function.name,
            args: JSON.parse(tc.function.arguments),
            mcpServer: tools.find((t) => t.name === tc.function.name)?.mcpServer,
          });
        }
      }
    }

    return {
      content: message?.content ?? '',
      toolCalls,
    };

  }

  // ─────────────────────────────────────────────────────────────
  // Private: Anthropic
  // ─────────────────────────────────────────────────────────────

  private async callAnthropic(
    model: string,
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<string> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized. Check ANTHROPIC_API_KEY.');
    }

    const response = await this.anthropicClient.messages.create({
      model,
      max_tokens: maxTokens ?? 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    const textBlock = response.content.find((c) => c.type === 'text');
    return textBlock?.type === 'text' ? textBlock.text : '';
  }

  private async callAnthropicWithTools(
    model: string,
    messages: Message[],
    tools: ToolDefinition[],
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
  ): Promise<LLMToolResponse> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized. Check ANTHROPIC_API_KEY.');
    }

    const anthropicTools: Anthropic.Tool[] = tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters as Anthropic.Tool.InputSchema,
    }));

    const anthropicMessages: Anthropic.MessageParam[] = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await this.anthropicClient.messages.create({
      model,
      max_tokens: maxTokens ?? 4096,
      system: systemPrompt,
      messages: anthropicMessages,
      tools: anthropicTools.length > 0 ? anthropicTools : undefined,
      temperature,
    });

    const toolCalls: ToolCall[] = [];
    let content = '';

    for (const block of response.content) {
      if (block.type === 'text') {
        content = block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          name: block.name,
          args: block.input as Record<string, any>,
          mcpServer: tools.find((t) => t.name === block.name)?.mcpServer,
        });
      }
    }

    return {
      content,
      toolCalls,
    };
  }
}
