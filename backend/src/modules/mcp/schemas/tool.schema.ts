// schemas/tool-action.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ToolAction {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;
}

export type ToolAuthType = 'none' | 'api_key' | 'oauth';

@Schema({ _id: false })
export class ToolAuth {
  @Prop({
    required: true,
    enum: ['none', 'api_key', 'oauth'],
  })
  type: ToolAuthType;

  @Prop({
    required: function () {
      return this.type === 'oauth';
    },
  })
  provider?: string;

  @Prop({
    type: [String],
    default: [],
  })
  scopes?: string[];
}

export type ToolDocument = Tool & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class Tool {
  @Prop({
    required: true,
    unique: true,
    index: true,
    trim: true,
  })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({
    enum: ['http', 'ws'],
    default: 'http',
  })
  transport: 'http' | 'ws';

  @Prop({ default: true })
  enabled: boolean;

  @Prop({
    type: ToolAuth,
    required: true,
  })
  auth: ToolAuth;

  @Prop({
    type: [ToolAction],
    default: [],
  })
  tools: ToolAction[];

  @Prop({
    type: Object,
  })
  metadata?: Record<string, any>;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const ToolSchema = SchemaFactory.createForClass(Tool);
