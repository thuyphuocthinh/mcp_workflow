// mcp.mapper.ts
import { McpContract } from "../contract/mcp.contract";

export function mapToolToContract(tool: any): McpContract {
  return {
    id: tool._id.toString(),
    name: tool.name,
    description: tool.description ?? "",
    key: tool.key,
    tools: (tool.tools ?? []).map((t: any) => {
      return {
        name: t.name,
        description: t.description
      }
    })
  };
}
