import { createMcpServer } from "../../core/index.js";
import {
  registerCreateSheetTool,
  registerGetSheetTool,
  registerAppendRowTool,
  registerListSheetsTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_GOOGLE_SHEETS_PORT) || 3005;

const { server, start } = createMcpServer({
  name: "google-sheets",
  version: "1.0.0",
  port: PORT,
});

// Register all google sheets tools
registerCreateSheetTool(server);
registerGetSheetTool(server);
registerAppendRowTool(server);
registerListSheetsTool(server);

export const main = start;