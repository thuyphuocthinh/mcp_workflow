import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserToolAuthDocument } from '../schemas/user-tool-auth.schema';

@Injectable()
export class TokenRefreshScheduler {
  private readonly logger = new Logger(TokenRefreshScheduler.name);

  constructor(
    @InjectModel('UserToolAuth')
    private readonly userToolAuthModel: Model<UserToolAuthDocument>,
  ) {}

  /**
   * Runs every 2 hours to refresh tokens that will expire within 10 minutes
   */
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleTokenRefresh() {
    this.logger.debug('Running scheduled token refresh check...');

    const now = new Date();
    const bufferMs = 10 * 60 * 1000; // 10 minutes buffer
    const threshold = new Date(now.getTime() + bufferMs);

    // Find all authorized tokens that will expire within 10 minutes
    const expiringTokens = await this.userToolAuthModel.find({
      status: 'AUTHORIZED',
      'token.expires_at': { $lte: threshold, $gt: now },
      'token.refresh_token': { $exists: true, $ne: null },
    });

    if (expiringTokens.length === 0) {
      this.logger.debug('No tokens need refresh');
      return;
    }

    this.logger.log(`Found ${expiringTokens.length} tokens to refresh`);

    for (const auth of expiringTokens) {
      try {
        await this.refreshToken(auth);
        this.logger.debug(`Refreshed token for user ${auth.user_id}, tool ${auth.tool_key}`);
      } catch (error) {
        this.logger.error(
          `Failed to refresh token for user ${auth.user_id}, tool ${auth.tool_key}: ${error}`,
        );
      }
    }
  }

  private async refreshToken(auth: UserToolAuthDocument): Promise<void> {
    const refreshToken = auth.token?.refresh_token;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured');
    }

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
      // Mark as expired if refresh fails
      await this.userToolAuthModel.updateOne(
        { _id: auth._id },
        { status: 'EXPIRED' },
      );
      throw new Error(`Token refresh failed: ${data.error_description}`);
    }

    // Update the token in database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    await this.userToolAuthModel.updateOne(
      { _id: auth._id },
      {
        $set: {
          'token.access_token': data.access_token,
          'token.expires_at': expiresAt,
          ...(data.refresh_token && { 'token.refresh_token': data.refresh_token }),
        },
      },
    );
  }
}
