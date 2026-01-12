import { Module } from '@nestjs/common';
import { McpService } from './services/mcp.service';
import { McpController } from './mcp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tool, ToolSchema } from './schemas/tool.schema';
import { UserToolAuth, UserToolAuthSchema } from './schemas/user-tool-auth.schema';
import { UserToolAuthController } from './mcp-auth.controller';
import { UserToolAuthService } from './services/mcp-auth.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tool.name, schema: ToolSchema },
      { name: UserToolAuth.name, schema: UserToolAuthSchema },
    ]),
  ],
  providers: [McpService, UserToolAuthService],
  controllers: [McpController, UserToolAuthController]
})
export class McpModule {}
