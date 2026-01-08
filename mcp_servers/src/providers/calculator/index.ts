import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import crypto from "node:crypto";
import { create, all } from "mathjs";

// Tạo MCP server
const server = new McpServer({
  name: "calculator",
  version: "1.0.0",
});

const math = create(all);

server.registerTool(
  "evaluate",
  {
    title: "Evaluate Expression",
    description: "Evaluate a mathematical expression",
    inputSchema: {
      expression: z.string().describe("Math expression, e.g. (2+3)*sin(pi/2)"),
    },
  },
  async (args, extra) => {
    try {
      const result = math.evaluate(args.expression);
      return {
        content: [
          { type: "text", text: `Result: ${result}` },
        ],
      };
    } catch (err: any) {
      return {
        content: [
          { type: "text", text: `Error: ${err.message}` },
        ],
      };
    }
  }
);

server.registerTool(
  "evaluateWithVars",
  {
    title: "Evaluate With Variables",
    description: "Evaluate expression with variables",
    inputSchema: {
      expression: z.string(),
      variables: z.record(z.string(), z.number()).optional(),
    },
  },
  async ({ expression, variables = {} }) => {
    try {
      const result = math.evaluate(expression, variables);
      return {
        content: [
          { type: "text", text: `Result: ${result}` },
        ],
      };
    } catch (e: any) {
      return {
        content: [
          { type: "text", text: `Error: ${e.message}` },
        ],
      };
    }
  }
);

server.registerTool(
  "derivative",
  {
    title: "Derivative",
    description: "Compute derivative of expression",
    inputSchema: {
      expression: z.string(),
      variable: z.string().default("x"),
    },
  },
  async ({ expression, variable }) => {
    try {
      const result = math.derivative(expression, variable).toString();
      return {
        content: [
          { type: "text", text: result },
        ],
      };
    } catch (e: any) {
      return {
        content: [
          { type: "text", text: `Error: ${e.message}` },
        ],
      };
    }
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
