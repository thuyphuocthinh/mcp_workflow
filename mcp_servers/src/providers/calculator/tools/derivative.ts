import { z } from "zod";
import { create, all } from "mathjs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";

const math = create(all);

/**
 * Compute derivative of expression
 */
export function registerDerivativeTool(server: McpServer) {
  server.registerTool(
    "derivative",
    {
      title: "Derivative",
      description: "Compute derivative of expression",
      inputSchema: {
        expression: z.string(),
        variable: z.string().default("x"),
      },
    },
    withErrorHandling("derivative", async (args: { expression: string; variable: string }) => {
      const { expression, variable } = args;
      const result = math.derivative(expression, variable).toString();
      return {
        content: [
          { type: "text" as const, text: result },
        ],
      };
    })
  );
}
