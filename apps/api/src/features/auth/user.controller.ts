import { User } from '@fusionauth/typescript-client';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CookieGuard } from './cookie.guard';
import { UpdateOwnProfileDto } from './dtos/update-own-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('me')
  @UseGuards(CookieGuard)
  async getOwnProfile(@CurrentUser() user: User) {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        login: user.email,
      },
      select: {
        login: false,
        name: true,
        surname: true,
        email: true,
        role: true,
      },
    });

    return {
      login: user.email,
      profile: profile ?? {
        name: null,
        surname: null,
        email: null,
        role: null,
      },
    };
  }

  @Post('me')
  @UseGuards(CookieGuard)
  async updateOwnProfile(
    @CurrentUser() user: User,
    @Body() data: UpdateOwnProfileDto,
  ) {
    const updatedProfile = await this.prismaService.profile.upsert({
      where: {
        login: user.email,
      },
      update: {
        name: data.name ?? '',
        surname: data.surname ?? '',
        email: data.email ?? '',
        role: user.registrations.find(
          (obj: any) =>
            obj.applicationId == process.env.FUSIONAUTH_APPLICATION_ID,
        ).roles[0],
      },
      create: {
        login: user.email,
        name: data.name ?? '',
        surname: data.surname ?? '',
        email: data.email ?? user.email,
        role: user.registrations.find(
          (obj: any) =>
            obj.applicationId == process.env.FUSIONAUTH_APPLICATION_ID,
        ).roles[0],
      },
    });

    return {
      login: user.email,
      profile: updatedProfile,
    };
  }
}
