import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SearchResult } from "../../../core/types.js";

// Fake search results for resource demo
const FAKE_SEARCH_RESULTS: SearchResult[] = [
  { title: "OpenAI GPT-5", url: "https://openai.com/gpt-5", snippet: "The latest GPT model..." },
  { title: "LangChain Docs", url: "https://docs.langchain.com/", snippet: "LangChain documentation for LLM apps" },
  { title: "NestJS Framework", url: "https://nestjs.com/", snippet: "Build efficient server-side applications with NestJS" },
];

/**
 * Register top search results resource
 */
export function registerTopSearchResultsResource(server: McpServer) {
  server.registerResource(
    "top-search-results",
    "search://top",
    {
      title: "Top Search Results",
      description: "Top search results from search engine",
      mimeType: "application/json",
    },
    async () => {
      return {
        contents: [
          {
            uri: "search://top",
            text: JSON.stringify(FAKE_SEARCH_RESULTS, null, 2),
            mimeType: "application/json",
          },
        ],
      };
    }
  );
}
