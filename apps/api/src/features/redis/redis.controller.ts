import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Post,
  Query,
} from '@nestjs/common';
import { RedisClientType } from 'redis';
import { CreateFileDto } from './dtos/create-file.dto';
import { REDIS_CLIENT } from './redis.types';

@Controller('redis')
export class RedisController {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  // GET http://localhost:3000/redis/key?key=foo
  @Get('key')
  async get(@Query('key') key: string) {
    try {
      const result = await this.redisClient.get(key);
      return { result };
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred while fetching data from Redis.' };
    }
  }

  @Post('key')
  async set(@Body() createDataDto: CreateFileDto) {
    try {
      const { key, value } = createDataDto;
      const result = await this.redisClient.set(key, value);
      return { result };
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred while setting data in Redis.' };
    }
  }

  @Delete('key')
  async del(@Query('key') key: string) {
    try {
      const result = await this.redisClient.del(key);
      return { result };
    } catch (error) {
      console.error(error);
      return { error: 'An error occurred while deleting data from Redis.' };
    }
  }
}
