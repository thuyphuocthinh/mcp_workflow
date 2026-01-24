import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserToolAuthDocument = UserToolAuth & Document;

/* ================= OAUTH TOKEN ================= */
@Schema({ _id: false })
export class OAuthToken {
  @Prop()
  access_token?: string;

  @Prop()
  refresh_token?: string;

  @Prop()
  expires_at?: Date;

  @Prop({
    type: [String],
    default: [],
  })
  scope?: string[];

  @Prop()
  token_type?: string;
}

export const OAuthTokenSchema =
  SchemaFactory.createForClass(OAuthToken);

/* ================= USER TOOL AUTH ================= */
@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class UserToolAuth {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  user_id: Types.ObjectId;

  @Prop({
    required: true,
    index: true,
  })
  tool_key: string;

  @Prop({
    required: true,
  })
  provider: string;

  @Prop({
    enum: ['AUTHORIZED', 'EXPIRED', 'REVOKED'],
    default: 'AUTHORIZED',
  })
  status: 'AUTHORIZED' | 'EXPIRED' | 'REVOKED';

  @Prop({
    type: OAuthTokenSchema,
  })
  token?: OAuthToken;

  @Prop({
    type: Object,
  })
  raw?: Record<string, any>;

  @Prop()
  created_at: Date;

  @Prop()
  updated_at: Date;
}

export const UserToolAuthSchema =
  SchemaFactory.createForClass(UserToolAuth);

/* ================= INDEX ================= */
// unique (user_id + tool_key)
UserToolAuthSchema.index(
  { user_id: 1, tool_key: 1 },
  { unique: true },
);
