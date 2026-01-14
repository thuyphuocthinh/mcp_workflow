import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_PROVIDER_SCOPES } from './google.scopes';
import { BadRequestException } from '@nestjs/common';

export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context) {
    const req = context.switchToHttp().getRequest();
    const provider = req.query.provider;

    if (!provider) {
      throw new BadRequestException('Missing provider');
    }


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
      state: provider, // dùng để verify lại ở callback
    };
  }
}
