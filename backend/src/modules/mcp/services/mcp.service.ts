import { Injectable } from '@nestjs/common';
import fs from "fs/promises";
import { McpContract } from '../contract/mcp.contract';

@Injectable()
export class McpService {
    async loadMcpRegistry(): Promise<McpContract> {
        const raw = await fs.readFile("mcp-registry.json", "utf-8");
        const parsed = JSON.parse(raw);
        return parsed.map(item => {
            return  {
                id: item.id,
                name: item.name,
                description: item.description,
                tools: item.tools
            }
        })
    }
}