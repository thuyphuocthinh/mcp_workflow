// src/mcp/google-search-server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import crypto from "crypto";

// === Fake search results ===
const FAKE_SEARCH_RESULTS = [
  { title: "OpenAI GPT-5", url: "https://openai.com/gpt-5", snippet: "The latest GPT model..." },
  { title: "LangChain Docs", url: "https://docs.langchain.com/", snippet: "LangChain documentation for LLM apps" },
  { title: "NestJS Framework", url: "https://nestjs.com/", snippet: "Build efficient server-side applications with NestJS" },
  { title: "TypeScript Guide", url: "https://www.typescriptlang.org/docs/", snippet: "Learn TypeScript step by step" },
];

// === Create MCP server ===
const server = new McpServer({
  name: "google-search",
  version: "1.0.0",
});

// === registerTool: search ===
server.registerTool(
  "search",
  {
    title: "Search Web",
    description: "Perform a web search and return top results",
    inputSchema: {
      query: z.string().describe("The search query"),
      limit: z.number().optional().describe("Number of results to return (default 3)"),
    },
  },
  async (args) => {
    const { query, limit = 3 } = args;

    const results = FAKE_SEARCH_RESULTS.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.snippet.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit);

    return {
      content: [
        {
          type: "text", // phải là "text", không được "json"
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
);


// === registerResource: top-search-results ===
server.registerResource(
  "top-search-results",
  "search://top",
  {
    title: "Top Search Results",
    description: "Top search results from fake search engine",
    mimeType: "application/json",
  },
  async () => {
    return {
      contents: [
        {
          uri: "search://top",
          text: JSON.stringify(FAKE_SEARCH_RESULTS.slice(0, 3), null, 2),
          mimeType: "application/json",
        },
      ],
    };
  }
);

// === registerPrompt: summarizeQuery ===
server.registerPrompt(
  "summarizeQuery",
  {
    description: "Generate summary of search query results",
    argsSchema: {
      query: z.string().describe("The search query to summarize"),
    },
  },
  ({ query }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Summarize top search results for query: "${query}"`,
          },
        },
      ],
    };
  }
);

// === Start MCP server with Express + HTTP transport ===
async function main() {
  const app = express();
  app.use(express.json());

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true, // trả JSON bình thường
  });

  await server.connect(transport);

  app.listen(8001, () => {
    console.log("Google Search MCP Server listening on port 8001");
  });
}

main().catch(console.error);
