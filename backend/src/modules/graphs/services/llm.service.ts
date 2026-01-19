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


    const geminiTools: any[] = tools.map((t) => {
      // Convert Zod/MCP schema to OpenAPI schema format for Gemini
      const openApiParams = this.convertToOpenAPISchema(t.parameters);
      
      return {
        name: t.name,
        description: t.description || `Function ${t.name}`,
        parameters: openApiParams,
      };
    });

    this.logger.debug(`Gemini tools: ${JSON.stringify(geminiTools)}`);

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

    // Only add tools if we have any - both tools and toolConfig must be in config for @google/genai SDK
    if (geminiTools.length > 0) {
      requestConfig.config.tools = [{ functionDeclarations: geminiTools }];
      requestConfig.config.toolConfig = {
        functionCallingConfig: {
          mode: 'AUTO',  // AUTO allows model to respond with text after tool execution
        },
      };
    }

    const result = await client.models.generateContent(requestConfig);

    this.logger.debug(`Gemini response: ${JSON.stringify(result)}`);

    // Parse function calls from response
    const functionCalls: ToolCall[] = [];
    const parts = result.candidates?.[0]?.content?.parts || [];

    this.logger.debug(`Gemini parts: ${JSON.stringify(parts)}`);
    
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

    const openaiTools: OpenAI.ChatCompletionTool[] = tools.map((t) => {
      // Convert Zod/MCP schema to OpenAPI schema format for OpenAI
      const openApiParams = this.convertToOpenAPISchema(t.parameters);
      
      return {
        type: 'function' as const,
        function: {
          name: t.name,
          description: t.description || `Function ${t.name}`,
          parameters: openApiParams,
        },
      };
    });

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

    const anthropicTools: Anthropic.Tool[] = tools.map((t) => {
      // Convert Zod/MCP schema to OpenAPI schema format for Anthropic
      const openApiParams = this.convertToOpenAPISchema(t.parameters);
      
      return {
        name: t.name,
        description: t.description || `Function ${t.name}`,
        input_schema: openApiParams as Anthropic.Tool.InputSchema,
      };
    });

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

  /**
   * Convert Zod/MCP schema to OpenAPI schema format for Gemini
   * MCP returns format like: { expression: { type: "string", def: {...} } }
   * Gemini needs: { type: "object", properties: { expression: { type: "string" } } }
   */
  private convertToOpenAPISchema(mcpParams: any): any {
    if (!mcpParams || typeof mcpParams !== 'object') {
      return { type: 'object', properties: {} };
    }

    // If already in OpenAPI format (has 'properties' key), return as is
    if (mcpParams.properties && mcpParams.type === 'object') {
      return mcpParams;
    }

    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(mcpParams)) {
      if (key === 'type' && value === 'object') continue;
      
      const propSchema = this.convertPropertySchema(value);
      if (propSchema) {
        properties[key] = propSchema.schema;
        if (propSchema.required) {
          required.push(key);
        }
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  /**
   * Convert a single property schema from Zod/MCP format to OpenAPI format
   */
  private convertPropertySchema(prop: any): { schema: any; required: boolean } | null {
    if (!prop || typeof prop !== 'object') {
      return null;
    }

    // Get the actual type - could be in 'type' or 'def.type'
    let zodType = prop.type;
    const def = prop.def;

    // Handle optional type
    if (zodType === 'optional' || def?.type === 'optional') {
      const innerType = prop.innerType || def?.innerType;
      const inner = this.convertPropertySchema(innerType);
      return inner ? { schema: inner.schema, required: false } : null;
    }

    // Handle default type (treat as optional)
    if (zodType === 'default' || def?.type === 'default') {
      const innerType = prop.innerType || def?.innerType;
      const inner = this.convertPropertySchema(innerType);
      return inner ? { schema: inner.schema, required: false } : null;
    }

    // Handle record type (object with dynamic keys)
    if (zodType === 'record' || def?.type === 'record') {
      return {
        schema: {
          type: 'object',
          additionalProperties: { type: 'number' },
        },
        required: true,
      };
    }

    // Handle array type
    if (zodType === 'array' || def?.type === 'array') {
      const itemType = prop.items || prop.innerType || def?.innerType;
      const itemSchema = itemType ? this.convertPropertySchema(itemType) : null;
      return {
        schema: {
          type: 'array',
          items: itemSchema?.schema || { type: 'string' },
        },
        required: true,
      };
    }

    // Handle primitive types
    const primitiveType = def?.type || zodType;
    if (['string', 'number', 'integer', 'boolean'].includes(primitiveType)) {
      return {
        schema: { type: primitiveType },
        required: true,
      };
    }

    // Fallback: try to infer type from structure
    if (typeof prop === 'object' && prop.type) {
      return {
        schema: { type: prop.type },
        required: true,
      };
    }

    // Default to string if unknown
    return {
      schema: { type: 'string' },
      required: true,
    };
  }
}
