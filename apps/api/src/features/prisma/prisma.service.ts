import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './client';

export class PrismaService extends PrismaClient implements OnModuleInit {
  onModuleInit() {
    return this.$connect();
  }
}
