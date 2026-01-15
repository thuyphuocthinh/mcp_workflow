import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_PROVIDER_SCOPES } from './google.scopes';
import { BadRequestException, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export class GoogleAuthGuard extends AuthGuard('google') {
  
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    console.log('[GoogleAuthGuard] handleRequest called');
    console.log('[GoogleAuthGuard] err:', err);
    console.log('[GoogleAuthGuard] user:', user);
    console.log('[GoogleAuthGuard] info:', info);
    console.log('[GoogleAuthGuard] status:', status);
    
    if (err) {
      console.error('[GoogleAuthGuard] Error in handleRequest:', err);
      throw err;
    }
    
    if (!user) {
      console.error('[GoogleAuthGuard] No user returned from strategy');
      throw new UnauthorizedException('Authentication failed');
    }
    
    return user;
  }

  getAuthenticateOptions(context) {
    const req = context.switchToHttp().getRequest();

    console.log('[GoogleAuthGuard] getAuthenticateOptions called');
    console.log('[GoogleAuthGuard] req.query:', req.query);

    if (req.query.code) {
      console.log('[GoogleAuthGuard] This is a callback request (has code), skipping auth options');
      return undefined;
    }

    const provider = req.query.provider;

    if (!provider) {
      throw new BadRequestException('Missing provider');
    }

    // Lấy userId từ req.user (nếu JwtAuthGuard đã chạy) hoặc từ token trong query string
    let userId: string | undefined = req.user?.id;
    console.log('[GoogleAuthGuard] userId from req.user:', userId);
    console.log('[GoogleAuthGuard] token from query:', req.query.token ? req.query.token.substring(0, 20) + '...' : 'none');

    // Nếu không có userId từ JwtAuthGuard, thử đọc từ query string token
    if (!userId && req.query.token) {
      try {
        const secret = process.env.JWT_SECRET || 'secret';
        console.log('[GoogleAuthGuard] Trying to decode token with secret:', secret.substring(0, 5) + '...');
        const decoded = jwt.verify(req.query.token, secret) as any;
        console.log('[GoogleAuthGuard] Decoded token:', decoded);
        userId = decoded.sub || decoded.id;
        console.log('[GoogleAuthGuard] userId from token:', userId);
      } catch (e) {
        console.error('[GoogleAuthGuard] Failed to verify token:', e.message);
        throw new UnauthorizedException('Invalid token');
      }
    }

    if (!userId) {
      console.error('[GoogleAuthGuard] userId is still undefined!');
      throw new UnauthorizedException('Missing userId - please provide a valid token');
    }

    const state = JSON.stringify({
      provider,
      userId,
    });

    console.log('[GoogleAuthGuard] Created state:', state);

    const scopes = GOOGLE_PROVIDER_SCOPES[provider];
    if (!scopes) {
      throw new BadRequestException(
        `Unsupported google provider: ${provider}`,
      );
    }

    return {
      scope: scopes,
      accessType: 'offline',
      prompt: 'consent',
      state, // dùng để verify lại ở callback
    };
  }
}


