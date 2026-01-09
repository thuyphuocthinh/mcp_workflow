import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/shared/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { GraphModule } from './modules/graphs/graphs.module';
import { McpModule } from './modules/mcp/mcp.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    GraphModule,
    McpModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
