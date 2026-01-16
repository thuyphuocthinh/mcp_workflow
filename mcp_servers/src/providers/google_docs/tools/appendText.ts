import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { googleDocsRequest } from "../helpers/docsClient.js";
import type { GoogleDoc } from "../../../core/types.js";

/**
 * Append text to end of a Google Doc
 */
export function registerAppendTextTool(server: McpServer) {
  server.registerTool(
    "appendText",
    {
      title: "Append Text",
      description: "Append text to the end of a Google Doc",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        documentId: z.string().describe("Document ID"),
        text: z.string().describe("Text to append"),
      },
    },
    withErrorHandling("appendText", async (args: { accessToken: string; documentId: string; text: string }) => {
      const { accessToken, documentId, text } = args;
      
      // First get the document to find the end index
      const doc = await googleDocsRequest<GoogleDoc>(
        accessToken,
        `/documents/${documentId}`
      );

      const endIndex = doc.body?.content?.slice(-1)?.[0]?.endIndex ?? 1;

      // Then insert text at the end
      await googleDocsRequest<void>(
        accessToken,
        `/documents/${documentId}:batchUpdate`,
        {
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                insertText: {
                  location: { index: endIndex - 1 },
                  text,
                },
              },
            ],
          }),
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: "Text appended successfully",
          },
        ],
      };
    })
  );
}
