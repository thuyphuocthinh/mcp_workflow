import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Graph, GraphSchema } from './schemas/graphs.schema';
import { GraphService } from './services/graphs.service';
import { GraphController } from './graphs.controller';
import { LLMService } from './services/llm.service';
import { NodeRegistry } from './registry/node.registry';
import { WorkflowRuntimeService } from './services/workflow.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Graph.name, schema: GraphSchema },
    ]),
  ],
  providers: [GraphService, LLMService, NodeRegistry, WorkflowRuntimeService],
  exports: [GraphService],
  controllers: [GraphController]
})
export class GraphModule {}
