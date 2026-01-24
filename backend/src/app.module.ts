import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@/shared/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { GraphModule } from './modules/graphs/graphs.module';
import { McpModule } from './modules/mcp/mcp.module';
import { ModelKeyModule } from './modules/models/models.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env', }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersModule,
    GraphModule,
    McpModule,
    ModelKeyModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
