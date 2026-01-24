import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling, NotFoundError } from "../../../core/errors.js";
import { readSheets } from "../helpers/sheetsStorage.js";

/**
 * Get sheet by ID
 */
export function registerGetSheetTool(server: McpServer) {
  server.registerTool(
    "getSheet",
    {
      title: "Get Sheet",
      description: "Get sheet by ID",
      inputSchema: {
        id: z.number().describe("Sheet ID"),
      },
    },
    withErrorHandling("getSheet", async (args: { id: number }) => {
      const { id } = args;
      const sheets = await readSheets();
      const sheet = sheets.find((s) => s.id === id);

      if (!sheet) {
        throw new NotFoundError(`Sheet with ID ${id}`);
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(sheet, null, 2),
          },
        ],
      };
    })
  );
}
