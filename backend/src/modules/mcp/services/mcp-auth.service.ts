import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { SuccessResponse } from '@/shared/response/success.response';
import {
  UserToolAuth,
  UserToolAuthDocument,
  OAuthToken,
} from '../schemas/user-tool-auth.schema';

@Injectable()
export class UserToolAuthService {
  private readonly logger = new Logger(UserToolAuthService.name);

  constructor(
    @InjectModel('UserToolAuth')
    private readonly userToolAuthModel: Model<UserToolAuthDocument>,
  ) {}

  /* ================= AUTHORIZE ================= */
  async authorize(params: {
    userId: string;
    toolKey: string;
    provider: string;
    token: OAuthToken;
    raw?: Record<string, any>;
  }): Promise<SuccessResponse<UserToolAuth>> {
    const { userId, toolKey, provider, token, raw } = params;

    const auth = await this.userToolAuthModel.findOneAndUpdate(
      {
        user_id: new Types.ObjectId(userId),
        tool_key: toolKey,
      },
      {
        $set: {
          provider,
          status: 'AUTHORIZED',
          token,
          raw,
        },
        $setOnInsert: {
          user_id: new Types.ObjectId(userId),
          tool_key: toolKey,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return new SuccessResponse({
      data: auth,
    });
  }

  /* ================= REVOKE ================= */
  async revoke(params: {
    userId: string;
    toolKey: string;
  }): Promise<SuccessResponse<null>> {
    const { userId, toolKey } = params;

    this.logger.log(`User ${userId} revoked tool ${toolKey}`);

    const res = await this.userToolAuthModel.updateOne(
      {
        user_id: new Types.ObjectId(userId),
        tool_key: toolKey,
      },
      {
        status: 'REVOKED',
        token: null,
      },
    );

    if (res.matchedCount === 0) {
      throw new NotFoundException('Tool authorization not found');
    }

    return new SuccessResponse({
      data: null,
    });
  }

  /* ================= MARK EXPIRED ================= */
  async markExpired(
    userId: string,
    toolKey: string,
  ): Promise<SuccessResponse<null>> {
    await this.userToolAuthModel.updateOne(
      {
        user_id: new Types.ObjectId(userId),
        tool_key: toolKey,
        status: 'AUTHORIZED',
      },
      {
        status: 'EXPIRED',
      },
    );

    return new SuccessResponse({
      data: null,
    });
  }

  /* ================= GET AUTH (INTERNAL) ================= */
  async getAuth(params: {
    userId: string;
    toolKey: string;
  }): Promise<SuccessResponse<UserToolAuth | null>> {
    const auth = await this.userToolAuthModel.findOne({
      user_id: new Types.ObjectId(params.userId),
      tool_key: params.toolKey,
    });

    return new SuccessResponse({
      data: auth,
    });
  }
}
