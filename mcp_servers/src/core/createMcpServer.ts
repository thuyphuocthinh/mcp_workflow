import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { Request, Response } from "express";
import crypto from "node:crypto";
import type { ProviderConfig } from "./types.js";

/**
 * Factory function to create an MCP server with proper Express + Transport binding
 * 
 * This fixes the critical bug where transport was not connected to Express routes
 */
export function createMcpServer(config: ProviderConfig) {
  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    enableJsonResponse: true,
  });

  /**
   * Start the MCP server with Express
   * - Creates Express app
   * - Binds transport to /mcp route (FIX for critical bug)
   * - Connects server to transport
   * - Listens on configured port
   */
  async function start(): Promise<void> {
    const app = express();
    app.use(express.json());

    // CRITICAL FIX: Bind transport to Express route
    // This was missing in original implementation
    app.post("/mcp", async (req: Request, res: Response) => {
      try {
        await transport.handleRequest(req, res);
      } catch (error) {
        console.error(`[${config.name}] MCP request error:`, error);
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
        });
      }
    });

    // Health check endpoint
    app.get("/health", (_req: Request, res: Response) => {
      res.json({ status: "ok", server: config.name, version: config.version });
    });

    await server.connect(transport);

    return new Promise((resolve) => {
      app.listen(config.port, () => {
        console.log(`[${config.name}] MCP Server listening on port ${config.port}`);
        resolve();
      });
    });
  }

  return {
    server,
    transport,
    start,
    config,
  };
}

export type McpServerInstance = ReturnType<typeof createMcpServer>;
