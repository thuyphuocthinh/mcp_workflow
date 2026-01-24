import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { readSheets, writeSheets } from "../helpers/sheetsStorage.js";

/**
 * Create a new sheet
 */
export function registerCreateSheetTool(server: McpServer) {
  server.registerTool(
    "createSheet",
    {
      title: "Create Sheet",
      description: "Create a new Google Sheet",
      inputSchema: {
        title: z.string().describe("The sheet title"),
        columns: z.array(z.string()).optional().describe("Column names"),
      },
    },
    withErrorHandling("createSheet", async (args: { title: string; columns?: string[] }) => {
      const { title, columns = [] } = args;
      const sheets = await readSheets();
      const id = sheets.length + 1;
      const newSheet = { id, title, columns, rows: [] };
      sheets.push(newSheet);
      await writeSheets(sheets);

      return {
        content: [
          {
            type: "text" as const,
            text: `Sheet created with ID ${id}`,
          },
        ],
      };
    })
  );
}
