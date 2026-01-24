import { ZodType } from "zod";

/**
 * Standard MCP tool response format
 */
export interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  name: string;
  version: string;
  port: number;
}

/**
 * Tool definition for type-safe tool registration
 */
export interface ToolDefinition<TInput = unknown> {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, ZodType>;
  handler: (args: TInput) => Promise<ToolResponse>;
}

/**
 * Resource definition
 */
export interface ResourceDefinition {
  name: string;
  uri: string;
  title: string;
  description: string;
  mimeType: string;
  handler: () => Promise<{
    contents: Array<{
      uri: string;
      text: string;
      mimeType: string;
    }>;
  }>;
}

/**
 * Prompt definition
 */
export interface PromptDefinition<TArgs = unknown> {
  name: string;
  description: string;
  argsSchema: Record<string, ZodType>;
  handler: (args: TArgs) => {
    messages: Array<{
      role: "user" | "assistant";
      content: {
        type: "text";
        text: string;
      };
    }>;
  };
}

/**
 * Google Sheets specific types
 */
export interface Sheet {
  id: number;
  title: string;
  columns: string[];
  rows: string[][];
}

/**
 * Google Docs specific types
 */
export interface GoogleDoc {
  documentId: string;
  title: string;
  body?: {
    content?: Array<{
      endIndex?: number;
    }>;
  };
}

/**
 * Search result type
 */
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}
