import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { AuthController } from './auth.controller';
import { CookieGuard } from './cookie.guard';
import { UsersController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [FusionAuthModule, ConfigModule, PrismaModule],
  controllers: [AuthController, UsersController],
  providers: [CookieGuard, UserService],
  exports: [CookieGuard, UserService],
})
export class AuthModule {}
