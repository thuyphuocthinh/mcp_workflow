import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { googleDocsRequest } from "../helpers/docsClient.js";
import type { GoogleDoc } from "../../../core/types.js";

/**
 * Get a Google Doc by ID
 */
export function registerGetDocTool(server: McpServer) {
  server.registerTool(
    "getDoc",
    {
      title: "Get Google Doc",
      description: "Get a Google Docs document by ID",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        documentId: z.string().describe("Document ID"),
      },
    },
    withErrorHandling("getDoc", async (args: { accessToken: string; documentId: string }) => {
      const { accessToken, documentId } = args;
      
      const doc = await googleDocsRequest<GoogleDoc>(
        accessToken,
        `/documents/${documentId}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(doc, null, 2),
          },
        ],
      };
    })
  );
}
