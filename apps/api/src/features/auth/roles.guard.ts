import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../decorators/role.decorator';
import { Role } from '../../decorators/enum/role.enum';
import { FUSIONAUTH_CLIENT } from '../fusionauth/fusionauth.types';
import FusionAuthClient from '@fusionauth/typescript-client';
import { AuthenticatedRequest } from './auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(FUSIONAUTH_CLIENT)
    private readonly fusionAuthClient: FusionAuthClient,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // Se non ci sono ruoli specificati, permetti l'accesso
    }
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookie = request.cookies?.accessToken;
    const { response } =
      await this.fusionAuthClient.retrieveUserUsingJWT(cookie);

    const userRoles = response.user.registrations.find(
      (obj: any) => obj.applicationId == process.env.FUSIONAUTH_APPLICATION_ID,
    ).roles as Role[];

    if (!userRoles) {
      throw new ForbiddenException('User roles not found!');
    }

    const hasRole = () =>
      userRoles.some((role: Role) => requiredRoles.includes(role));
    if (!hasRole()) {
      throw new ForbiddenException(
        'You do not have the necessary role to access this functionality!',
      );
    }
    return true;
  }
}
