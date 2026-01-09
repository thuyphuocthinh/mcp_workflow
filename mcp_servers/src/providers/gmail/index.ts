import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { google } from "googleapis";
import { z } from "zod";
import express from "express";
import crypto from "node:crypto";

// ================= MCP SERVER =================
const server = new McpServer({
  name: "gmail",
  version: "1.0.0",
});

// ================= Helper =================
function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  return google.gmail({ version: "v1", auth });
}

// ================= listEmails =================
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
  async ({ accessToken, maxResults }) => {
    const gmail = getGmailClient(accessToken);

    const res = await gmail.users.messages.list({
      userId: "me",
      maxResults,
    });

    const messages = res.data.messages ?? [];

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(messages, null, 2),
        },
      ],
    };
  }
);

// ================= readEmail =================
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
  async ({ accessToken, messageId }) => {
    const gmail = getGmailClient(accessToken);

    const res = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full",
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(res.data, null, 2),
        },
      ],
    };
  }
);

// ================= sendEmail =================
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
  async ({ accessToken, to, subject, body }) => {
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
        { type: "text", text: "Email sent successfully" },
      ],
    };
  }
);

// ================= START SERVER =================
 export async function main() {
  const app = express();
  app.use(express.json());

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const port =  process.env.MCP_GMAIL_PORT;
  app.listen(port, () => console.log(`Gmail MCP Server listening on port ${port}`));
}
