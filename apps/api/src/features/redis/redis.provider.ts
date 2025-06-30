import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { AppConfig } from 'src/config/app.config';
import { REDIS_CLIENT } from './redis.types';

export const RedisProvider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: async function (configService: ConfigService) {
    const client = createClient({
      url: `redis://${configService.get(
        AppConfig.Redis.Host,
      )}:${configService.get(AppConfig.Redis.Port)}`,
    });

    await client.connect();

    return client;
  },
};
