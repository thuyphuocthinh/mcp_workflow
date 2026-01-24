import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ModelKeyDocument = ModelKey & Document;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class ModelKey {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  encryptedKey: string;

  @Prop({
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    })
  user_id: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  modelType: string;
}

export const ModelKeySchema = SchemaFactory.createForClass(ModelKey);
ModelKeySchema.index(
  { user_id: 1, modelType: 1 },
  { unique: true },
);
