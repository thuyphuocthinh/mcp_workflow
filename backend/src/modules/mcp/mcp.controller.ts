import { Controller, Get } from "@nestjs/common";
import { McpService } from "./services/mcp.service";

@Controller('tools')
export class McpController {
    constructor(private readonly mcpService: McpService) {}

    @Get()
    getListTools() {
        return this.mcpService.loadMcpRegistry();
    }
}