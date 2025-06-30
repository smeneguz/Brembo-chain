import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CookieGuard } from '../auth/cookie.guard';
import { VerificationService } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get()
  @UseGuards(CookieGuard)
  async getVerification() {
    return await this.verificationService.getVerificationResults();
  }

  @Get(':state')
  @UseGuards(CookieGuard)
  async getVerificationInformation(@Param('state') state: boolean) {
    return await this.verificationService.getVerificationInformation(state);
  }
}
