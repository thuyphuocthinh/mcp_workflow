import { createMcpServer } from "../../core/index.js";
import { registerSearchTool } from "./tools/index.js";
import { registerTopSearchResultsResource } from "./resources/index.js";
import { registerSummarizeQueryPrompt } from "./prompts/index.js";

const PORT = Number(process.env.MCP_GOOGLE_SEARCH_PORT) || 3004;

const { server, start } = createMcpServer({
  name: "google-search",
  version: "1.0.0",
  port: PORT,
});

// Register tools
registerSearchTool(server);

// Register resources
registerTopSearchResultsResource(server);

// Register prompts
registerSummarizeQueryPrompt(server);

export const main = start;