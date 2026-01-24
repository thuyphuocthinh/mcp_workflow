import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    console.log('[GoogleStrategy] validate called');
    console.log('[GoogleStrategy] state from query:', req.query.state);

    let stateData: { provider: string; userId: string } | string = req.query.state;

    try {
      if (typeof stateData === 'string' && stateData.startsWith('{')) {
        stateData = JSON.parse(stateData);
        console.log('[GoogleStrategy] parsed state:', stateData);
      }
    } catch (e) {
      console.error('[GoogleStrategy] Failed to parse state:', e);
      // fallback to raw string if parse fails (legacy support or tempering)
    }

    const providerKey =
      typeof stateData === 'object' ? stateData.provider : stateData;
    const userId =
      typeof stateData === 'object' ? stateData.userId : undefined;

    console.log('[GoogleStrategy] providerKey:', providerKey);
    console.log('[GoogleStrategy] userId:', userId);

    if (!userId) {
      console.error('[GoogleStrategy] userId is undefined! State was:', req.query.state);
      throw new UnauthorizedException('Missing userId in state - please re-authorize');
    }

    return {
      id: userId, // Pass userId to req.user
      provider: 'google',
      providerKey,
      accessToken,
      refreshToken,
      profile,
    };
  }
}

