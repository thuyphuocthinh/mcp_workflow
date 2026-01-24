import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getGmailClient } from "../helpers/gmailClient.js";

/**
 * List emails from Gmail
 */
export function registerListEmailsTool(server: McpServer) {
  server.registerTool(
    "listEmails",
    {
      title: "List Emails",
      description: "List latest Gmail messages",
      inputSchema: {
        accessToken: z.string().describe("OAuth access token"),
        maxResults: z.number().optional().default(5),
      },
    },
    withErrorHandling("listEmails", async (args: { accessToken: string; maxResults: number }) => {
      const { accessToken, maxResults } = args;
      const gmail = getGmailClient(accessToken);

      const res = await gmail.users.messages.list({
        userId: "me",
        maxResults,
      });

      const messages = res.data.messages ?? [];

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(messages, null, 2),
          },
        ],
      };
    })
  );
}
