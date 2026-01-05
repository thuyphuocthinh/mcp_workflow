// src/base/MCPClient.ts

import { MCPTool, ToolCallArgs, ToolResult } from "../types";

export abstract class MCPClient {
  abstract fetchTools(): Promise<MCPTool[]>;
  abstract callTool(name: string, args: ToolCallArgs): Promise<ToolResult>;
}
