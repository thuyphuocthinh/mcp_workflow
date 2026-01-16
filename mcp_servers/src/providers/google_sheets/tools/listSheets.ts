import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { readSheets } from "../helpers/sheetsStorage.js";

/**
 * List all sheets
 */
export function registerListSheetsTool(server: McpServer) {
  server.registerTool(
    "listSheets",
    {
      title: "List Sheets",
      description: "List all sheet titles",
      inputSchema: {},
    },
    withErrorHandling("listSheets", async () => {
      const sheets = await readSheets();
      const text = sheets.map((s) => `[${s.id}] ${s.title}`).join("\n");

      return {
        content: [
          { type: "text" as const, text: text || "No sheets yet" },
        ],
      };
    })
  );
}
