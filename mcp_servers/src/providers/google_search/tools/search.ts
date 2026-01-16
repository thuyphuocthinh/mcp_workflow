import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { googleSearch } from "../../../utils/googleSearch.util.js";

/**
 * Perform Google web search
 */
export function registerSearchTool(server: McpServer) {
  server.registerTool(
    "search",
    {
      title: "Search Web",
      description: "Perform a real Google web search",
      inputSchema: {
        query: z.string().describe("Search query"),
        limit: z.number().optional().describe("Max results (default: 3)"),
      },
    },
    withErrorHandling("search", async (args: { query: string; limit?: number }) => {
      const { query, limit = 3 } = args;
      const results = await googleSearch(query, limit);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    })
  );
}
