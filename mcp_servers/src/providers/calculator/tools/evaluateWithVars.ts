import { z } from "zod";
import { create, all } from "mathjs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "../../../core/errors.js";

const math = create(all);

/**
 * Evaluate expression with variables
 */
export function registerEvaluateWithVarsTool(server: McpServer) {
  server.registerTool(
    "evaluateWithVars",
    {
      title: "Evaluate With Variables",
      description: "Evaluate expression with variables",
      inputSchema: {
        expression: z.string(),
        variables: z.record(z.string(), z.number()).optional(),
      },
    },
    withErrorHandling("evaluateWithVars", async (args: { expression: string; variables?: Record<string, number> }) => {
      const { expression, variables = {} } = args;
      const result = math.evaluate(expression, variables);
      return {
        content: [
          { type: "text" as const, text: `Result: ${result}` },
        ],
      };
    })
  );
}
