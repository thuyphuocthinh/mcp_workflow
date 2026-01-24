import { createMcpServer } from "../../core/index.js";
import {
  registerGetPresentationTool,
  registerCreatePresentationTool,
  registerAddSlideTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_GOOGLE_SLIDES_PORT) || 3007;

const { server, start } = createMcpServer({
  name: "google-slides",
  version: "1.0.0",
  port: PORT,
});

// Register all google slides tools
registerGetPresentationTool(server);
registerCreatePresentationTool(server);
registerAddSlideTool(server);

export const main = start;
