// mcp.mapper.ts
import { McpContract } from "../contract/mcp.contract";

export function mapToolToContract(tool: any): McpContract {
  return {
    id: tool._id.toString(),
    name: tool.name,
    description: tool.description ?? "",
    is_authorized: false,
    tools: Object.fromEntries(
      (tool.tools ?? []).map((t: any) => [t.name, t.description])
    )
  };
}
