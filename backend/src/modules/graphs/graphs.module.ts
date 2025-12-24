import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Graph, GraphSchema } from './schemas/graphs.schema';
import { GraphService } from './services/graphs.service';
import { GraphController } from './graphs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Graph.name, schema: GraphSchema },
    ]),
  ],
  providers: [GraphService],
  exports: [GraphService],
  controllers: [GraphController]
})
export class GraphModule {}
