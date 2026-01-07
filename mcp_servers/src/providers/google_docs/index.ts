import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import express from 'express'

const DATA_PATH = path.join(process.cwd(), "./docs.json");

// Helper để đọc/ghi file docs.json
async function readDocs() {
  return fs.readFile(DATA_PATH, "utf-8")
    .then(JSON.parse)
    .catch(() => []);
}
async function writeDocs(docs: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(docs, null, 2));
}

// Tạo server MCP
const server = new McpServer({
  name: "google-docs",
  version: "1.0.0",
});

// --- create docs
server.registerTool(
  "createDoc",
  {
    title: "Create Document",
    description: "Create a new Google Doc",
    inputSchema: {
      title: z.string().describe("The document title"),
      content: z.string().optional().describe("Initial content"),
    },
  },
  async ({ title, content }) => {
    const docs = await readDocs();
    const id = docs.length + 1;
    const newDoc = { id, title, content: content || "" };
    docs.push(newDoc);
    await writeDocs(docs);

    return {
      content: [
        {
          type: "text",
          text: `Document created with ID ${id}`,
        },
      ],
    };
  }
);

// === registerTool: getDoc ===
server.registerTool(
  "getDoc",
  {
    title: "Get Document",
    description: "Get document by ID",
    inputSchema: {
      id: z.number().describe("The document ID"),
    },
  },
  async ({ id }) => {
    const docs = await readDocs();
    const doc = docs.find((d: any) => d.id === id);
    return {
      content: [
        {
          type: "text",
          text: doc ? JSON.stringify(doc, null, 2) : "Document not found",
        },
      ],
    };
  }
);

// === registerTool: appendText ===
server.registerTool(
  "appendText",
  {
    title: "Append Text",
    description: "Append text to a document",
    inputSchema: {
      id: z.number().describe("The document ID"),
      text: z.string().describe("Text to append"),
    },
  },
  async ({ id, text }) => {
    const docs = await readDocs();
    const doc = docs.find((d: any) => d.id === id);
    if (!doc) {
      return {
        content: [{ type: "text", text: "Document not found" }],
      };
    }
    doc.content += text;
    await writeDocs(docs);
    return {
      content: [{ type: "text", text: "Text appended" }],
    };
  }
);

// === registerTool: listDocs ===
server.registerTool(
  "listDocs",
  {
    title: "List Documents",
    description: "List all document titles",
    inputSchema: {},
  },
  async () => {
    const docs = await readDocs();
    const text = docs.map((d: any) => `[${d.id}] ${d.title}`).join("\n");
    return {
      content: [{ type: "text", text: text || "No documents yet" }],
    };
  }
);

// === registerResource: docs list ===
server.registerResource(
  "all-docs",
  "docs://all",
  {
    title: "All Google Docs",
    description: "List of all docs",
    mimeType: "application/json",
  },
  async () => {
    const docs = await readDocs();
    return {
      contents: [
        {
          uri: "docs://all",
          text: JSON.stringify(docs, null, 2),
          mimeType: "application/json",
        },
      ],
    };
  }
);

// === registerPrompt: writeSummary ===
server.registerPrompt(
  "writeSummary",
  {
    description: "Generate summary of a document",
    argsSchema: {
      id: z.number().describe("The document ID to summarize"),
    },
  },
  ({ id }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please summarize content of doc ID ${id}`,
          },
        },
      ],
    };
  }
);

// === Start server ===
async function main() {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });

  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    await transport.handleRequest(req, res);
  });


  await server.connect(transport);

  app.listen(8000, () => {
    console.log("✅ MCP Server HTTP listening on http://localhost:8000/mcp");
  });

}

main().catch(console.error);