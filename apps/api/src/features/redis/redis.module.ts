import { Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { REDIS_CLIENT } from './redis.types';
import { RedisController } from './redis.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [RedisController],
  providers: [RedisProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
