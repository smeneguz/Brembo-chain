import { Module } from '@nestjs/common';
import { RotorService } from './rotor.service';
import { RotorController } from './rotor.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { WriteRotorProcessor } from './rotor.processor';
import { RedisModule } from '../redis/redis.module';
import { RotorContractProvider } from './contract.provider'; 
import { BlockchainModule } from '../blockchain/blockchain.module';
import { web3Provider } from '../blockchain/web3.provider';
import { SftpService } from '../sftp/sftp.service';

@Module({
  imports: [RedisModule, FusionAuthModule, ConfigModule, PrismaModule, BlockchainModule],
  controllers: [RotorController],
  providers: [RotorService, CookieGuard, PrismaService, WriteRotorProcessor, RotorContractProvider, web3Provider, SftpService],
})
export class RotorModule {}
