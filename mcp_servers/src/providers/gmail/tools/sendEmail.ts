import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";
import { getGmailClient } from "../helpers/gmailClient.js";

interface SendEmailArgs {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
}

/**
 * Send an email via Gmail
 */
export function registerSendEmailTool(server: McpServer) {
  server.registerTool(
    "sendEmail",
    {
      title: "Send Email",
      description: "Send an email via Gmail",
      inputSchema: {
        accessToken: z.string(),
        to: z.string(),
        subject: z.string(),
        body: z.string(),
      },
    },
    withErrorHandling("sendEmail", async (args: SendEmailArgs) => {
      const { accessToken, to, subject, body } = args;
      const gmail = getGmailClient(accessToken);

      const message = [
        `To: ${to}`,
        "Content-Type: text/plain; charset=utf-8",
        `Subject: ${subject}`,
        "",
        body,
      ].join("\n");

      const encodedMessage = Buffer
        .from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      await gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      return {
        content: [
          { type: "text" as const, text: "Email sent successfully" },
        ],
      };
    })
  );
}
