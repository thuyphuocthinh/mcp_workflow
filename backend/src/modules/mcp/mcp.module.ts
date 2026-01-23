import { Module } from '@nestjs/common';
import { McpService } from './services/mcp.service';
import { McpController } from './mcp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tool, ToolSchema } from './schemas/tool.schema';
import { UserToolAuth, UserToolAuthSchema } from './schemas/user-tool-auth.schema';
import { UserToolAuthController } from './mcp-auth.controller';
import { UserToolAuthService } from './services/mcp-auth.service';
import { TokenRefreshScheduler } from './services/token-refresh.scheduler';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tool.name, schema: ToolSchema },
      { name: UserToolAuth.name, schema: UserToolAuthSchema },
    ]),
  ],
  providers: [McpService, UserToolAuthService, TokenRefreshScheduler, GoogleStrategy],
  controllers: [McpController, UserToolAuthController],
  exports: [UserToolAuthService],
})
export class McpModule {}

