import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ToolDefinition } from '../types/langraph.types';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface MCPServerConfig {
  name: string;
  url: string;
  requiresAuth: boolean;
}

@Injectable()
export class MCPClientService {
  private readonly logger = new Logger(MCPClientService.name);

  // Map: server name → config
  private serverConfigs: Map<string, MCPServerConfig>;

  constructor(private readonly configService: ConfigService) {
    // Initialize server configs (local URLs)
    this.serverConfigs = new Map<string, MCPServerConfig>([
      ['calculator', { name: 'calculator', url: 'http://localhost:3001', requiresAuth: false }],
      ['gmail', { name: 'gmail', url: 'http://localhost:3002', requiresAuth: true }],
      ['google-docs', { name: 'google-docs', url: 'http://localhost:3003', requiresAuth: true }],
      ['google-sheets', { name: 'google-sheets', url: 'http://localhost:3005', requiresAuth: true }],
      ['google-search', { name: 'google-search', url: 'http://localhost:3004', requiresAuth: false }],
      ['google-calendar', { name: 'google-calendar', url: 'http://localhost:3006', requiresAuth: true }],
      ['google-slides', { name: 'google-slides', url: 'http://localhost:3007', requiresAuth: true }],
      ['google-drive', { name: 'google-drive', url: 'http://localhost:3008', requiresAuth: true }],
    ]);
  }

  /**
   * Call an MCP tool with retry logic (3 attempts)
   */
  async callTool(
    server: string,
    toolName: string,
    args: Record<string, any>,
  ): Promise<any> {
    const config = this.serverConfigs.get(server);
    if (!config) {
      throw new Error(`Unknown MCP server: ${server}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.debug(`[${server}/${toolName}] Attempt ${attempt}/${MAX_RETRIES}`);

        const response = await fetch(`${config.url}/mcp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            id: Date.now(),
            params: {
              name: toolName,
              arguments: args,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error.message || 'Unknown MCP error');
        }

        this.logger.debug(`[${server}/${toolName}] Success on attempt ${attempt}`);
        return result.result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `[${server}/${toolName}] Attempt ${attempt} failed: ${lastError.message}`,
        );

        if (attempt < MAX_RETRIES) {
          await this.delay(RETRY_DELAY_MS * attempt); // Exponential backoff
        }
      }
    }

    this.logger.error(`[${server}/${toolName}] All ${MAX_RETRIES} attempts failed`);
    throw new Error(
      `MCP tool call failed after ${MAX_RETRIES} retries: ${lastError?.message}`,
    );
  }

  /**
   * Call tool with accessToken (for Google services)
   */
  async callToolWithAuth(
    server: string,
    toolName: string,
    args: Record<string, any>,
    accessToken: string,
  ): Promise<any> {
    return this.callTool(server, toolName, { ...args, accessToken });
  }

  /**
   * List all available tools from an MCP server
   */
  async listTools(server: string): Promise<ToolDefinition[]> {
    const config = this.serverConfigs.get(server);
    if (!config) {
      throw new Error(`Unknown MCP server: ${server}`);
    }

    try {
      const response = await fetch(`${config.url}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/event-stream',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          id: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      return (result.result?.tools || []).map((tool: any) => ({
        name: tool.name,
        description: tool.description || '',
        parameters: tool.inputSchema || {},
        mcpServer: server,
      }));
    } catch (error) {
      this.logger.error(`Failed to list tools from ${server}: ${error}`);
      return [];
    }
  }

  /**
   * Get tools from multiple MCP servers
   */
  async getToolsFromServers(servers: string[]): Promise<ToolDefinition[]> {
    const allTools: ToolDefinition[] = [];

    for (const server of servers) {
      try {
        const tools = await this.listTools(server);
        allTools.push(...tools);
      } catch (error) {
        this.logger.warn(`Failed to list tools from ${server}: ${error}`);
      }
    }

    return allTools;
  }

  /**
   * Check if a server requires authentication
   */
  requiresAuth(server: string): boolean {
    return this.serverConfigs.get(server)?.requiresAuth ?? false;
  }

  /**
   * Get all available server names
   */
  getAvailableServers(): string[] {
    return Array.from(this.serverConfigs.keys());
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
