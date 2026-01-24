import { createMcpServer } from "../../core/index.js";
import {
  registerEvaluateTool,
  registerEvaluateWithVarsTool,
  registerDerivativeTool,
} from "./tools/index.js";

const PORT = Number(process.env.MCP_CALCULATOR_PORT) || 3001;

const { server, start } = createMcpServer({
  name: "calculator",
  version: "1.0.0",
  port: PORT,
});

// Register all calculator tools
registerEvaluateTool(server);
registerEvaluateWithVarsTool(server);
registerDerivativeTool(server);

export const main = start;