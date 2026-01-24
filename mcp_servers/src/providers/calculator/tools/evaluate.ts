import { z } from "zod";
import { create, all } from "mathjs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";

const math = create(all);

/**
 * Evaluate mathematical expression
 */
export function registerEvaluateTool(server: McpServer) {
  server.registerTool(
    "evaluate",
    {
      title: "Evaluate Expression",
      description: "Evaluate a mathematical expression",
      inputSchema: {
        expression: z.string().describe("Math expression, e.g. (2+3)*sin(pi/2)"),
      },
    },
    withErrorHandling("evaluate", async (args: { expression: string }) => {
      const result = math.evaluate(args.expression);
      return {
        content: [
          { type: "text" as const, text: `Result: ${result}` },
        ],
      };
    })
  );
}
