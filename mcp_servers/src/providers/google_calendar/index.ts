import { createMcpServer } from "../../core/index.js";
import {
  registerListEventsTool,
  registerCreateEventTool,
  registerDeleteEventTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_GOOGLE_CALENDAR_PORT) || 3006;

const { server, start } = createMcpServer({
  name: "google-calendar",
  version: "1.0.0",
  port: PORT,
});

// Register all google calendar tools
registerListEventsTool(server);
registerCreateEventTool(server);
registerDeleteEventTool(server);

export const main = start;
