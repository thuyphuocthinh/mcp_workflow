import { AuthGuard } from '@nestjs/passport';
import { GOOGLE_PROVIDER_SCOPES } from './google.scopes';

export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context) {
    const req = context.switchToHttp().getRequest();
    const provider = req.query.provider;

    const scopes = GOOGLE_PROVIDER_SCOPES[provider];

    if (!scopes) {
      throw new Error(`Unsupported google provider: ${provider}`);
    }

    return {
      scope: scopes,
      accessType: 'offline',
      prompt: 'consent',
      state: provider, // dùng để verify lại ở callback
    };
  }
}
