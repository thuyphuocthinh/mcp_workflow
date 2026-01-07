import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import crypto from "node:crypto";

// Tạo MCP server
const server = new McpServer({
  name: "calculator",
  version: "1.0.0",
});

// --- add ---
server.registerTool(
  "add",
  {
    title: "Add",
    description: "Add two numbers",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
  },
  async ({ a, b }, extra) => {
    return {
      content: [
        { type: "text", text: `Result: ${a + b}` },
      ],
    };
  }
);

// --- subtract ---
server.registerTool(
  "subtract",
  {
    title: "Subtract",
    description: "Subtract two numbers",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
  },
  async ({ a, b }, extra) => {
    return {
      content: [
        { type: "text", text: `Result: ${a - b}` },
      ],
    };
  }
);

// --- multiply ---
server.registerTool(
  "multiply",
  {
    title: "Multiply",
    description: "Multiply two numbers",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
    },
  },
  async ({ a, b }, extra) => {
    return {
      content: [
        { type: "text", text: `Result: ${a * b}` },
      ],
    };
  }
);

// --- divide ---
server.registerTool(
  "divide",
  {
    title: "Divide",
    description: "Divide two numbers",
    inputSchema: {
      a: z.number().describe("Numerator"),
      b: z.number().describe("Denominator"),
    },
  },
  async ({ a, b }, extra) => {
    if (b === 0) {
      return {
        content: [
          { type: "text", text: "Error: Division by zero" },
        ],
      };
    }
    return {
      content: [
        { type: "text", text: `Result: ${a / b}` },
      ],
    };
  }
);

// --- Start MCP server ---
async function main() {
  const app = express();
  app.use(express.json());

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
  });

  await server.connect(transport);

  app.listen(8003, () => console.log("Calculator MCP Server listening on port 8002"));
}

main().catch(console.error);
