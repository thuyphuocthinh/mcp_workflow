export type ToolCallArgs = Record<string, any>;
export interface ToolResult {
  ok: boolean;
  data?: any;
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema?: any;   // nếu muốn có schema JSON
  outputSchema?: any;  // nếu muốn có schema JSON
}