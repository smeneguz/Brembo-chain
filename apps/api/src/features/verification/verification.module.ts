import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [FusionAuthModule, ConfigModule, PrismaModule],
  controllers: [VerificationController],
  providers: [VerificationService, CookieGuard, PrismaService],
})
export class VerificationModule {}
