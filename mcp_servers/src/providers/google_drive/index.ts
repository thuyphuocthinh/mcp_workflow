import { createMcpServer } from "../../core/index.js";
import {
  registerListFilesTool,
  registerGetFileTool,
  registerDeleteFileTool,
  registerCreateFolderTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_GOOGLE_DRIVE_PORT) || 3008;

const { server, start } = createMcpServer({
  name: "google-drive",
  version: "1.0.0",
  port: PORT,
});

// Register all google drive tools
registerListFilesTool(server);
registerGetFileTool(server);
registerDeleteFileTool(server);
registerCreateFolderTool(server);

export const main = start;
