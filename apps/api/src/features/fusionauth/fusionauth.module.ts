import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FusionAuthClientProvider } from './fusionauth-client.provider';
import { FUSIONAUTH_CLIENT } from './fusionauth.types';

@Module({
  imports: [ConfigModule],
  providers: [FusionAuthClientProvider],
  exports: [FUSIONAUTH_CLIENT],
})
export class FusionAuthModule {}
