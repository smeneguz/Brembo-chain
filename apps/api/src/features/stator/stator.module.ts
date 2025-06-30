import { Module } from '@nestjs/common';
import { StatorController } from './stator.controller';
import { StatorService } from './stator.service';
import { PrismaService } from '../prisma/prisma.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { WriteStatorProcessor } from './stator.processor';
import { RedisModule } from '../redis/redis.module';
import { StatorContractProvider } from './contract.provider';
import { web3Provider } from '../blockchain/web3.provider'; 
import { SftpService } from '../sftp/sftp.service';

@Module({
  imports: [RedisModule, FusionAuthModule, ConfigModule, BlockchainModule, PrismaModule],
  controllers: [StatorController],
  providers: [StatorService, WriteStatorProcessor, CookieGuard, PrismaService, StatorContractProvider, web3Provider, SftpService],
})
export class StatorModule {}
