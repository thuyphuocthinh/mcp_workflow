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
import { ModelKeyService } from '../../models/services/modelKey.service';

export interface LLMCallOptions {
  provider: LLMProvider;
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

export interface LLMCallWithToolsOptions {
  provider: LLMProvider;
  model: string;
  messages: Message[];
  tools: ToolDefinition[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly modelKeyService: ModelKeyService,
  ) {
    this.logger.log('LLMService initialized (dynamic key loading from database)');
  }

  private async getApiKey(provider: LLMProvider, userId?: string): Promise<string | null> {
    // Map provider to modelType in database
    const modelTypeMap: Record<LLMProvider, string> = {
      gemini: 'GEMINI',
      openai: 'OPENAI',
      anthropic: 'ANTHROPIC',
    };

    const modelType = modelTypeMap[provider];

    // Try to get key from database if userId is provided
    if (userId) {
      try {
        const key = await this.modelKeyService.getDecryptedKey(userId, modelType);
        if (key) {
          this.logger.debug(`[${provider}] Using API key from database for user ${userId}`);
          return key;
        }
      } catch (error) {
        // Key not found in database, will fallback to env
        this.logger.debug(`[${provider}] No database key for user ${userId}, falling back to env`);
      }
    }

    // Fallback to environment variables
    const envKeyMap: Record<LLMProvider, string[]> = {
      gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
      openai: ['OPENAI_API_KEY'],
      anthropic: ['ANTHROPIC_API_KEY'],
    };

    for (const envKey of envKeyMap[provider]) {
      const key = this.configService.get<string>(envKey);
      if (key) {
        this.logger.debug(`[${provider}] Using API key from environment (${envKey})`);
        return key;
      }
    }

    return null;
  }

  private async getGeminiClient(userId?: string): Promise<GoogleGenAI> {
    const key = await this.getApiKey('gemini', userId);
    if (!key) {
      throw new Error('Gemini API key not found. Add it in database or set GEMINI_API_KEY env.');
    }
    return new GoogleGenAI({ apiKey: key });
  }

  private async getOpenAIClient(userId?: string): Promise<OpenAI> {
    const key = await this.getApiKey('openai', userId);
    if (!key) {
      throw new Error('OpenAI API key not found. Add it in database or set OPENAI_API_KEY env.');
    }
    return new OpenAI({ apiKey: key });
  }

  private async getAnthropicClient(userId?: string): Promise<Anthropic> {
    const key = await this.getApiKey('anthropic', userId);
    if (!key) {
      throw new Error('Anthropic API key not found. Add it in database or set ANTHROPIC_API_KEY env.');
    }
    return new Anthropic({ apiKey: key });
  }

  async call(options: LLMCallOptions): Promise<string> {
    const { provider, model, prompt, systemPrompt, temperature, maxTokens, userId } =
      options;

    this.logger.debug(`LLM call: ${provider}/${model}`);

    switch (provider) {
      case 'gemini':
        return this.callGemini(model, prompt, systemPrompt, temperature, maxTokens, userId);
      case 'openai':
        return this.callOpenAI(model, prompt, systemPrompt, temperature, maxTokens, userId);
      case 'anthropic':
        return this.callAnthropic(model, prompt, systemPrompt, temperature, maxTokens, userId);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  async callWithTools(options: LLMCallWithToolsOptions): Promise<LLMToolResponse> {
    const { provider, model, messages, tools, systemPrompt, temperature, maxTokens, userId } =
      options;

    this.logger.debug(`LLM call with tools: ${provider}/${model}, ${tools.length} tools`);

    switch (provider) {
      case 'gemini':
        return this.callGeminiWithTools(model, messages, tools, systemPrompt, temperature, maxTokens, userId);
      case 'openai':
        return this.callOpenAIWithTools(model, messages, tools, systemPrompt, temperature, maxTokens, userId);
      case 'anthropic':
        return this.callAnthropicWithTools(model, messages, tools, systemPrompt, temperature, maxTokens, userId);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private async callGemini(
    model: string,
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
    userId?: string,
  ): Promise<string> {
    const client = await this.getGeminiClient(userId);

    const result = await client.models.generateContent({
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
    userId?: string,
  ): Promise<LLMToolResponse> {
    const client = await this.getGeminiClient(userId);

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

    const result = await client.models.generateContent(requestConfig);

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

  private async callOpenAI(
    model: string,
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
    userId?: string,
  ): Promise<string> {
    const client = await this.getOpenAIClient(userId);

    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await client.chat.completions.create({
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
    userId?: string,
  ): Promise<LLMToolResponse> {
    const client = await this.getOpenAIClient(userId);

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

    const response = await client.chat.completions.create({
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

  private async callAnthropic(
    model: string,
    prompt: string,
    systemPrompt?: string,
    temperature?: number,
    maxTokens?: number,
    userId?: string,
  ): Promise<string> {
    const client = await this.getAnthropicClient(userId);

    const response = await client.messages.create({
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
    userId?: string,
  ): Promise<LLMToolResponse> {
    const client = await this.getAnthropicClient(userId);

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

    const response = await client.messages.create({
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
