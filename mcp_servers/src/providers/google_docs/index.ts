import { createMcpServer } from "../../core/index.js";
import {
  registerCreateDocTool,
  registerGetDocTool,
  registerAppendTextTool,
  registerReplaceTextTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_GOOGLE_DOCS_PORT) || 3003;

const { server, start } = createMcpServer({
  name: "google-docs",
  version: "1.0.0",
  port: PORT,
});

// Register all google docs tools
registerCreateDocTool(server);
registerGetDocTool(server);
registerAppendTextTool(server);
registerReplaceTextTool(server);

export const main = start;