import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register summarize query prompt
 */
export function registerSummarizeQueryPrompt(server: McpServer) {
  server.registerPrompt(
    "summarizeQuery",
    {
      description: "Generate summary of search query results",
      argsSchema: {
        query: z.string().describe("The search query to summarize"),
      },
    },
    ({ query }: { query: string }) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Summarize top search results for query: "${query}"`,
            },
          },
        ],
      };
    }
  );
}
