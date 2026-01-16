// ─────────────────────────────────────────────────────────────
// Message types for LLM conversations
// ─────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
  toolCallId?: string;
  name?: string;  // Tool name for tool messages
}

// ─────────────────────────────────────────────────────────────
// Tool definitions (from MCP servers)
// ─────────────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;  // JSON Schema
  mcpServer: string;                // Which MCP server owns this tool
}

export interface ToolCall {
  name: string;
  args: Record<string, any>;
  mcpServer?: string;
}

// ─────────────────────────────────────────────────────────────
// LLM Response types
// ─────────────────────────────────────────────────────────────

export interface LLMToolResponse {
  content: string;
  toolCalls: ToolCall[];
}

// ─────────────────────────────────────────────────────────────
// Workflow State
// ─────────────────────────────────────────────────────────────

export interface WorkflowState {
  input: string;
  output?: string;
  messages: Message[];
  context: Record<string, any>;
  error?: string;
  ok?: boolean;
  retryCount: number;
}
