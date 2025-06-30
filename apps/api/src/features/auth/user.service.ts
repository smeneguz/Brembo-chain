import FusionAuthClient from '@fusionauth/typescript-client';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';
import { FUSIONAUTH_CLIENT } from '../fusionauth/fusionauth.types';
import { LoginWithCredentialsDto } from './dtos/login-with-credentials.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(FUSIONAUTH_CLIENT)
    private readonly fusionAuthClient: FusionAuthClient,
    private readonly configService: ConfigService,
  ) {}

  public async getUserByLogin(login: string) {
    try {
      const existingUser =
        await this.fusionAuthClient.retrieveUserByUsername(login);
      return existingUser;
    } catch {
      return null;
    }
  }

  public async getUserByEmail(email: string) {
    try {
      const existingUser =
        await this.fusionAuthClient.retrieveUserByEmail(email);
      return existingUser;
    } catch {
      return null;
    }
  }

  public async loginWithCredentials(data: LoginWithCredentialsDto) {
    try {
      const { response } = await this.fusionAuthClient.login({
        loginId: data.login,
        password: data.password,
        applicationId: this.configService.get(
          AppConfig.Fusionauth.ApplicationId,
        ),
      });

      return response.token;
    } catch (error: any) {
      throw new UnauthorizedException();
    }
  }
}
