import { Injectable } from '@nestjs/common';
import fs from "fs/promises";
import path from "path";
import { z } from 'zod';
import { SuccessResponse } from '@/shared/response/success.response';

@Injectable()
export class McpService {
  async loadMcpRegistry(): Promise<SuccessResponse> {
    const filePath = path.resolve(
        process.cwd(),
        'src',
        'modules',
        'mcp',
        'config',
        'mcp-registry.json'
    );

    const raw = await fs.readFile(filePath, 'utf-8');
    const McpRegistrySchema = z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().optional(),
                tools: z.array(
                z.object({
                    name: z.string(),
                    description: z.string(),
                })
            ),
        })
    );

    const parsed = McpRegistrySchema.parse(JSON.parse(raw));

    return new SuccessResponse({
        data: parsed.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            tools: item.tools,
        }))
    })
  }
}
