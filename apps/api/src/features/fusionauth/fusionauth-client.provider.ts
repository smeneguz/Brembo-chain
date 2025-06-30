import FusionAuthClient from '@fusionauth/typescript-client';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/app.config';

import { FUSIONAUTH_CLIENT } from './fusionauth.types';

export const FusionAuthClientProvider = {
  provide: FUSIONAUTH_CLIENT,
  useFactory: (config: ConfigService) => {
    const client = new FusionAuthClient(
      config.get(AppConfig.Fusionauth.ApiKey),
      config.get(AppConfig.Fusionauth.Url),
    );

    return client;
  },
  inject: [ConfigService],
};
