import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { Graph, GraphSchema } from './schemas/graphs.schema';
import { GraphService } from './services/graphs.service';
import { GraphController } from './graphs.controller';
import { LLMService } from './services/llm.service';
import { MCPClientService } from './services/mcp-client.service';
import { NodeRegistry } from './registry/node.registry';
import { WorkflowRuntimeService } from './services/workflow.service';
import { McpModule } from '../mcp/mcp.module';
import { ModelKeyModule } from '../models/models.module';

@Module({
  imports: [
    ConfigModule,
    McpModule,
    ModelKeyModule,
    MongooseModule.forFeature([
      { name: Graph.name, schema: GraphSchema },
    ]),
  ],
  providers: [
    GraphService,
    LLMService,
    MCPClientService,
    NodeRegistry,
    WorkflowRuntimeService,
  ],
  exports: [
    GraphService,
    LLMService,
    MCPClientService,
  ],
  controllers: [GraphController],
})
export class GraphModule {}
