import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express, { Request, Response } from "express";
import crypto from "node:crypto";
import type { ProviderConfig } from "./types.js";

// Store registered tools for direct access
interface ToolRegistration {
  name: string;
  description?: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}

/**
 * Factory function to create an MCP server with direct JSON-RPC handling
 * 
 * This bypasses StreamableHTTPServerTransport issues by handling JSON-RPC directly
 */
export function createMcpServer(config: ProviderConfig) {
  // Tool registry for direct JSON-RPC handling
  const tools: Map<string, ToolRegistration> = new Map();
  
  // Create McpServer for compatibility with existing tool registration code
  const server = new McpServer({
    name: config.name,
    version: config.version,
  });

  // Intercept tool registrations
  const originalRegisterTool = server.registerTool.bind(server);
  server.registerTool = (name: string, options: any, handler: any) => {
    // Store for direct access
    tools.set(name, {
      name,
      description: options.description || options.title,
      inputSchema: options.inputSchema,
      handler,
    });
    // Also register with McpServer
    return originalRegisterTool(name, options, handler);
  };

  // Also intercept tool() method
  const originalTool = server.tool.bind(server);
  (server as any).tool = (name: string, schemaOrHandler: any, handlerOrUndefined?: any) => {
    const schema = handlerOrUndefined ? schemaOrHandler : {};
    const handler = handlerOrUndefined || schemaOrHandler;
    
    tools.set(name, {
      name,
      description: schema.description,
      inputSchema: schema,
      handler,
    });
    
    return originalTool(name, schemaOrHandler, handlerOrUndefined);
  };

  /**
   * Start the MCP server with Express and direct JSON-RPC handling
   */
  async function start(): Promise<void> {
    const app = express();
    app.use(express.json());

    // Handle MCP JSON-RPC requests directly
    app.post("/mcp", async (req: Request, res: Response) => {
      try {
        const jsonrpc = req.body;
        
        if (!jsonrpc || jsonrpc.jsonrpc !== "2.0") {
          return res.status(400).json({
            jsonrpc: "2.0",
            error: { code: -32600, message: "Invalid Request" },
            id: jsonrpc?.id || null,
          });
        }

        let result: any;

        switch (jsonrpc.method) {
          case "initialize":
            result = {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: { listChanged: false },
              },
              serverInfo: {
                name: config.name,
                version: config.version,
              },
            };
            break;

          case "tools/list":
            result = {
              tools: Array.from(tools.values()).map((t) => ({
                name: t.name,
                description: t.description || "",
                inputSchema: t.inputSchema || { type: "object", properties: {} },
              })),
            };
            break;

          case "tools/call":
            const { name, arguments: args } = jsonrpc.params || {};
            const tool = tools.get(name);
            
            if (!tool) {
              return res.status(400).json({
                jsonrpc: "2.0",
                error: { code: -32601, message: `Unknown tool: ${name}` },
                id: jsonrpc.id,
              });
            }

            try {
              result = await tool.handler(args || {});
            } catch (toolError) {
              return res.status(200).json({
                jsonrpc: "2.0",
                error: {
                  code: -32000,
                  message: toolError instanceof Error ? toolError.message : "Tool execution failed",
                },
                id: jsonrpc.id,
              });
            }
            break;

          case "notifications/initialized":
            // Just acknowledge
            return res.status(202).send();

          default:
            return res.status(400).json({
              jsonrpc: "2.0",
              error: { code: -32601, message: `Method not found: ${jsonrpc.method}` },
              id: jsonrpc.id,
            });
        }

        res.json({
          jsonrpc: "2.0",
          result,
          id: jsonrpc.id,
        });
      } catch (error) {
        console.error(`[${config.name}] MCP request error:`, error);
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : "Internal server error",
          },
          id: req.body?.id || null,
        });
      }
    });

    // Health check endpoint
    app.get("/health", (_req: Request, res: Response) => {
      res.json({ status: "ok", server: config.name, version: config.version });
    });

    return new Promise((resolve) => {
      app.listen(config.port, () => {
        console.log(`[${config.name}] MCP Server listening on port ${config.port}`);
        resolve();
      });
    });
  }

  return {
    server,
    start,
    config,
  };
}

export type McpServerInstance = ReturnType<typeof createMcpServer>;
