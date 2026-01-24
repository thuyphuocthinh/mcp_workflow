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
  ) { }

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

  /* ================= GET ACCESS TOKEN (WITH AUTO-REFRESH) ================= */
  /**
   * Get a valid access token for a tool, automatically refreshing if expired.
   * Throws if no authorization exists or refresh fails.
   */
  async getAccessToken(params: {
    userId: string;
    toolKey: string;
  }): Promise<string> {
    const { userId, toolKey } = params;

    const auth = await this.userToolAuthModel.findOne({
      user_id: new Types.ObjectId(userId),
      tool_key: toolKey,
      status: 'AUTHORIZED',
    });

    if (!auth || !auth.token?.access_token) {
      throw new NotFoundException(
        `No authorization found for tool "${toolKey}". Please authenticate first.`,
      );
    }

    // Check if token is expired (with 1 hour buffer)
    // expiresAt is stored in UTC, compare with current UTC time
    const expiresAt = auth.token.expires_at;
    const bufferMs = 60 * 60 * 1000;
    // Date.now() returns UTC milliseconds, so comparison is UTC vs UTC
    const nowUtc = Date.now();
    const isExpired = expiresAt && nowUtc >= expiresAt.getTime() - bufferMs;

    if (isExpired && auth.token.refresh_token) {
      this.logger.debug(`Token expired for user ${userId}, tool ${toolKey}. Refreshing...`);
      return this.refreshGoogleToken(userId, toolKey, auth.token.refresh_token);
    }

    return auth.token.access_token;
  }

  /* ================= REFRESH GOOGLE TOKEN ================= */
  private async refreshGoogleToken(
    userId: string,
    toolKey: string,
    refreshToken: string,
  ): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();

      if (data.error) {
        this.logger.error(`Token refresh failed: ${data.error_description}`);
        // Mark as expired if refresh fails
        await this.markExpired(userId, toolKey);
        throw new Error(`Failed to refresh token: ${data.error_description}`);
      }

      // Update the token in database
      // Store expires_at in UTC (Date.now() returns UTC milliseconds)
      const expiresAt = new Date(Date.now() + data.expires_in * 1000);

      await this.userToolAuthModel.updateOne(
        {
          user_id: new Types.ObjectId(userId),
          tool_key: toolKey,
        },
        {
          $set: {
            'token.access_token': data.access_token,
            'token.expires_at': expiresAt,
            // Note: refresh_token is not always returned on refresh
            ...(data.refresh_token && { 'token.refresh_token': data.refresh_token }),
          },
        },
      );

      this.logger.debug(`Token refreshed for user ${userId}, tool ${toolKey}`);
      return data.access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh token: ${error}`);
      throw error;
    }
  }
}

