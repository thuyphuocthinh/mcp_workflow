import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import express from "express";
import crypto from "node:crypto";

const DATA_PATH = path.join(process.cwd(), "./sheets.json");

// Helpers đọc/ghi file
async function readSheets() {
  return fs.readFile(DATA_PATH, "utf-8")
    .then(JSON.parse)
    .catch(() => []);
}

async function writeSheets(sheets: any[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(sheets, null, 2));
}

// Tạo MCP server
const server = new McpServer({
  name: "google-sheets",
  version: "1.0.0",
});

// --- createSheet ---
server.registerTool(
  "createSheet",
  {
    title: "Create Sheet",
    description: "Create a new Google Sheet",
    inputSchema: {
      title: z.string().describe("The sheet title"),
      columns: z.array(z.string()).optional().describe("Column names"),
    },
  },
  async (args, extra) => {
    const { title, columns = [] } = args;
    const sheets = await readSheets();
    const id = sheets.length + 1;
    const newSheet = { id, title, columns, rows: [] };
    sheets.push(newSheet);
    await writeSheets(sheets);

    return {
      content: [
        {
          type: "text",
          text: `Sheet created with ID ${id}`,
        },
      ],
    };
  }
);

// --- getSheet ---
server.registerTool(
  "getSheet",
  {
    title: "Get Sheet",
    description: "Get sheet by ID",
    inputSchema: {
      id: z.number().describe("Sheet ID"),
    },
  },
  async (args, extra) => {
    const { id } = args;
    const sheets = await readSheets();
    const sheet = sheets.find((s: any) => s.id === id);

    return {
      content: [
        {
          type: "text",
          text: sheet ? JSON.stringify(sheet, null, 2) : "Sheet not found",
        },
      ],
    };
  }
);

// --- appendRow ---
server.registerTool(
  "appendRow",
  {
    title: "Append Row",
    description: "Append a row to a sheet",
    inputSchema: {
      id: z.number().describe("Sheet ID"),
      row: z.array(z.string()).describe("Row values"),
    },
  },
  async (args, extra) => {
    const { id, row } = args;
    const sheets = await readSheets();
    const sheet = sheets.find((s: any) => s.id === id);

    if (!sheet) {
      return {
        content: [{ type: "text", text: "Sheet not found" }],
      };
    }

    sheet.rows.push(row);
    await writeSheets(sheets);

    return {
      content: [{ type: "text", text: "Row appended" }],
    };
  }
);

// --- listSheets ---
server.registerTool(
  "listSheets",
  {
    title: "List Sheets",
    description: "List all sheet titles",
    inputSchema: {},
  },
  async (args, extra) => {
    const sheets = await readSheets();
    const text = sheets.map((s: any) => `[${s.id}] ${s.title}`).join("\n");

    return {
      content: [{ type: "text", text: text || "No sheets yet" }],
    };
  }
);

// --- Start MCP server ---
export async function main() {
  const app = express();
  app.use(express.json());

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
  });

  await server.connect(transport);
  const port = process.env.MCP_GOOGLE_SHEETS_PORT;
  app.listen(port, () => console.log(`Google Sheets MCP Server listening on port ${port}`));
}