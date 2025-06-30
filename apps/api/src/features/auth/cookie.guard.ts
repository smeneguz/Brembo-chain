import FusionAuthClient from '@fusionauth/typescript-client';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';

import { FUSIONAUTH_CLIENT } from '../fusionauth/fusionauth.types';
import { AuthenticatedRequest } from './auth.types';

@Injectable()
export class CookieGuard implements CanActivate {
  constructor(
    @Inject(FUSIONAUTH_CLIENT)
    private readonly fusionAuthClient: FusionAuthClient,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const cookie = request.cookies?.accessToken;
    if (!cookie) {
      return false;
    }

    try {
      await this.fusionAuthClient.validateJWT(cookie);
      const { response } = await this.fusionAuthClient.retrieveUserUsingJWT(
        cookie,
      );

      request.user = response.user;

      return true;
    } catch {
      return false;
    }
  }
}
