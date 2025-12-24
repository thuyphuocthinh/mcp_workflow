import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FlowEdge, FlowNode } from '../types/graph.types';

export type GraphDocument = Graph & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Graph {
  @Prop({
    required: true,
    trim: true,
    maxlength: 128,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 300,
  })
  description: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  user_id: Types.ObjectId;

  @Prop({
    type: [Object],
    default: [],
  })
  nodes: FlowNode[];

  @Prop({
    type: [Object],
    default: [],
  })
  edges: FlowEdge[];

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const GraphSchema = SchemaFactory.createForClass(Graph);
