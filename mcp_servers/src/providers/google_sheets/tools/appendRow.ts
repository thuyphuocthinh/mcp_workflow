import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling, NotFoundError } from "../../../core/errors.js";
import { readSheets, writeSheets } from "../helpers/sheetsStorage.js";

/**
 * Append a row to a sheet
 */
export function registerAppendRowTool(server: McpServer) {
  server.registerTool(
    "appendRow",
    {
      title: "Append Row",
      description: "Append a row to a sheet",
      inputSchema: {
        id: z.number().describe("Sheet ID"),
        row: z.array(z.string()).describe("Row values"),
      },
    },
    withErrorHandling("appendRow", async (args: { id: number; row: string[] }) => {
      const { id, row } = args;
      const sheets = await readSheets();
      const sheet = sheets.find((s) => s.id === id);

      if (!sheet) {
        throw new NotFoundError(`Sheet with ID ${id}`);
      }

      sheet.rows.push(row);
      await writeSheets(sheets);

      return {
        content: [
          { type: "text" as const, text: "Row appended" },
        ],
      };
    })
  );
}
