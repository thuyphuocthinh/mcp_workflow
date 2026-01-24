import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getGmailClient } from "../helpers/gmailClient.js";

/**
 * Read a specific email by ID
 */
export function registerReadEmailTool(server: McpServer) {
  server.registerTool(
    "readEmail",
    {
      title: "Read Email",
      description: "Read a Gmail message by ID",
      inputSchema: {
        accessToken: z.string(),
        messageId: z.string(),
      },
    },
    withErrorHandling("readEmail", async (args: { accessToken: string; messageId: string }) => {
      const { accessToken, messageId } = args;
      const gmail = getGmailClient(accessToken);

      const res = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(res.data, null, 2),
          },
        ],
      };
    })
  );
}
