import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { googleDocsRequest } from "../helpers/docsClient.js";
import type { GoogleDoc } from "../../../core/types.js";

/**
 * Create a new Google Doc
 */
export function registerCreateDocTool(server: McpServer) {
  server.registerTool(
    "createDoc",
    {
      title: "Create Google Doc",
      description: "Create a new Google Docs document",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        title: z.string().describe("Document title"),
      },
    },
    withErrorHandling("createDoc", async (args: { accessToken: string; title: string }) => {
      const { accessToken, title } = args;
      
      const doc = await googleDocsRequest<GoogleDoc>(
        accessToken,
        "/documents",
        {
          method: "POST",
          body: JSON.stringify({ title }),
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: `Created document\nID: ${doc.documentId}\nTitle: ${doc.title}`,
          },
        ],
      };
    })
  );
}
