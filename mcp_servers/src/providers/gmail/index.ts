import { createMcpServer } from "../../core/index.js";
import {
  registerListEmailsTool,
  registerReadEmailTool,
  registerSendEmailTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_GMAIL_PORT) || 3002;

const { server, start } = createMcpServer({
  name: "gmail",
  version: "1.0.0",
  port: PORT,
});

// Register all gmail tools
registerListEmailsTool(server);
registerReadEmailTool(server);
registerSendEmailTool(server);

export const main = start;
