export type FlowNodePosition = {
  x: number;
  y: number;
};

// ─────────────────────────────────────────────────────────────
// Node Data Types
// ─────────────────────────────────────────────────────────────

export type LLMProvider = 'gemini' | 'openai' | 'anthropic';

export interface LLMNodeData {
  label: string;
  userPrompt: string; // Prompt template, có thể chứa {{input}}
  systemPrompt?: string; // Optional system instruction
  provider: LLMProvider;
  model: string; // 'gemini-2.5-flash', 'gpt-4o', 'claude-3-sonnet'
  temperature?: number;
  maxTokens?: number;
}

export interface MCPToolNodeData {
  label: string;
  mcpServer: string; // 'gmail', 'google-docs', 'google-sheets'
  toolName: string; // 'sendEmail', 'createDoc', 'appendRow'
  toolArgs: Record<string, any>;
}

export interface AgentNodeData {
  label: string;
  userPrompt?: string; // Optional user instruction
  systemPrompt: string;
  provider: LLMProvider;
  model: string;
  mcpServers: string[]; // List MCP servers agent có thể dùng
  maxIterations?: number; // Default: 10
}

export interface StartNodeData {
  label: string;
}

export interface EndNodeData {
  label: string;
}

export type FlowNodeData =
  | LLMNodeData
  | MCPToolNodeData
  | AgentNodeData
  | StartNodeData
  | EndNodeData
  | Record<string, any>;

export type FlowNodeType = 'start' | 'end' | 'llm' | 'mcp-tool' | 'agent';

export type FlowNode = {
  id: string;
  type?: FlowNodeType | string;
  position: FlowNodePosition;
  data?: FlowNodeData;
};

export type FlowEdge = {
  id: string;
  type: string;
  source: string;
  target: string;
  soureHandle: string;
  targetHandle: string;
};
