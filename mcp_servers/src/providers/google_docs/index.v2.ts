import "dotenv/config";
import fetch, { RequestInit, HeadersInit } from "node-fetch";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

/**
 * =====================================================
 * ENV
 * =====================================================
 */
const GOOGLE_ACCESS_TOKEN = process.env.GOOGLE_ACCESS_TOKEN;
if (!GOOGLE_ACCESS_TOKEN) {
  throw new Error("Missing GOOGLE_ACCESS_TOKEN");
}

const GOOGLE_DOCS_BASE = "https://docs.googleapis.com/v1";

/**
 * =====================================================
 * TYPES
 * =====================================================
 */
interface GoogleDoc {
  documentId: string;
  title: string;
  body?: {
    content?: {
      endIndex?: number;
    }[];
  };
}

/**
 * =====================================================
 * HTTP HELPER
 * =====================================================
 */
async function googleDocsRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${GOOGLE_DOCS_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers as HeadersInit),
      Authorization: `Bearer ${GOOGLE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Google Docs API error ${res.status}: ${text}`,
    );
  }

  return (await res.json()) as T;
}

/**
 * =====================================================
 * SERVER
 * =====================================================
 */
const server = new McpServer({
  name: "google-docs-server",
  version: "1.0.0",
});

/**
 * =====================================================
 * TOOLS
 * =====================================================
 */

server.registerTool(
  "createDoc",
  {
    title: "Create Google Doc",
    description: "Create a new Google Docs document",
    inputSchema: {
      title: z.string(),
    },
  },
  async ({ title }) => {
    const doc = await googleDocsRequest<GoogleDoc>(
      "/documents",
      {
        method: "POST",
        body: JSON.stringify({ title }),
      },
    );

    return {
      content: [
        {
          type: "text",
          text: `Created document\nID: ${doc.documentId}\nTitle: ${doc.title}`,
        },
      ],
    };
  },
);

server.registerTool(
  "getDoc",
  {
    title: "Get Google Doc",
    description: "Get a Google Docs document by ID",
    inputSchema: {
      documentId: z.string(),
    },
  },
  async ({ documentId }) => {
    const doc = await googleDocsRequest<GoogleDoc>(
      `/documents/${documentId}`,
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(doc, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "appendText",
  {
    title: "Append Text",
    description: "Append text to the end of a Google Doc",
    inputSchema: {
      documentId: z.string(),
      text: z.string(),
    },
  },
  async ({ documentId, text }) => {
    const doc = await googleDocsRequest<GoogleDoc>(
      `/documents/${documentId}`,
    );

    const endIndex =
      doc.body?.content?.slice(-1)?.[0]?.endIndex ?? 1;

    await googleDocsRequest<void>(
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
      },
    );

    return {
      content: [
        {
          type: "text",
          text: "Text appended successfully",
        },
      ],
    };
  },
);

server.registerTool(
  "replaceText",
  {
    title: "Replace Text",
    description: "Replace all occurrences of text in a document",
    inputSchema: {
      documentId: z.string(),
      searchText: z.string(),
      replaceText: z.string(),
    },
  },
  async ({ documentId, searchText, replaceText }) => {
    await googleDocsRequest<void>(
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
      },
    );

    return {
      content: [
        {
          type: "text",
          text: "Text replaced successfully",
        },
      ],
    };
  },
);

/**
 * =====================================================
 * START SERVER
 * =====================================================
 */
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID(),
});

await server.connect(transport);
console.log("✅ Google Docs MCP Server running");
