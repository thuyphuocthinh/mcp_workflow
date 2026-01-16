import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { googleDocsRequest } from "../helpers/docsClient.js";

interface ReplaceTextArgs {
  accessToken: string;
  documentId: string;
  searchText: string;
  replaceText: string;
}

/**
 * Replace all occurrences of text in a document
 */
export function registerReplaceTextTool(server: McpServer) {
  server.registerTool(
    "replaceText",
    {
      title: "Replace Text",
      description: "Replace all occurrences of text in a document",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        documentId: z.string().describe("Document ID"),
        searchText: z.string().describe("Text to search for"),
        replaceText: z.string().describe("Replacement text"),
      },
    },
    withErrorHandling("replaceText", async (args: ReplaceTextArgs) => {
      const { accessToken, documentId, searchText, replaceText } = args;
      
      await googleDocsRequest<void>(
        accessToken,
        `/documents/${documentId}:batchUpdate`,
        {
          method: "POST",
          body: JSON.stringify({
            requests: [
              {
                replaceAllText: {
                  containsText: {
                    text: searchText,
                    matchCase: true,
                  },
                  replaceText,
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
            text: "Text replaced successfully",
          },
        ],
      };
    })
  );
}
