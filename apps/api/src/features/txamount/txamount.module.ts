import { TxamountService } from './txamount.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { RedisModule } from '../redis/redis.module';
import { web3Provider } from '../blockchain/web3.provider';
import { TxamountController } from './txamount.controller';

@Module({
  imports: [
    RedisModule,
    FusionAuthModule,
    ConfigModule,
    BlockchainModule,
    PrismaModule,
  ],
  controllers: [TxamountController],
  providers: [TxamountService, CookieGuard, PrismaService, web3Provider],
})
export class TxamountModule {}
