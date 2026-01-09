import { Module } from '@nestjs/common';
import { McpService } from './services/mcp.service';
import { McpController } from './mcp.controller';
@Module({
  providers: [McpService],
  controllers: [McpController]
})
export class McpModule {}
