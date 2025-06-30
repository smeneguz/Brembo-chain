import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CookieGuard } from './cookie.guard';
import { LoginWithCredentialsDto } from './dtos/login-with-credentials.dto';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  @Post('login')
  public async loginWithCredentials(
    @Body() data: LoginWithCredentialsDto,
    @Res() res: Response,
  ) {
    const token = await this.userService.loginWithCredentials(data);
    const userInfo = (await this.userService.getUserByEmail(data.login))
      .response.user;

    await this.prismaService.profile.upsert({
      where: {
        login: userInfo.email,
      },
      update: {
        name: userInfo.firstName ?? '',
        surname: userInfo.lastName ?? '',
        email: userInfo.email ?? '',
        role: userInfo.registrations.find(
          (obj: any) =>
            obj.applicationId == process.env.FUSIONAUTH_APPLICATION_ID,
        ).roles[0],
      },
      create: {
        login: userInfo.email,
        name: userInfo.firstName ?? '',
        surname: userInfo.lastName ?? '',
        email: userInfo.email ?? '',
        role: userInfo.registrations.find(
          (obj: any) =>
            obj.applicationId == process.env.FUSIONAUTH_APPLICATION_ID,
        ).roles[0],
      },
    });

    res.cookie('accessToken', token, {
      httpOnly: true,
    });

    return res.status(200).send();
  }

  @Post('logout')
  @UseGuards(CookieGuard)
  public async logout(@Res() res: Response) {
    res.clearCookie('accessToken');

    return res.status(200).send();
  }
}
