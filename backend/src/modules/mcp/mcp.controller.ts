import { Controller, Get, UseGuards } from "@nestjs/common";
import { McpService } from "./services/mcp.service";
import { JwtAuthGuard } from "@/shared/guards/jwt-auth.guard";

@Controller('tools')
@UseGuards(JwtAuthGuard)
export class McpController {
    constructor(private readonly mcpService: McpService) {}

    @Get()
    getListTools() {
        return this.mcpService.loadMcpRegistry();
    }
}