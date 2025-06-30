import { Module } from '@nestjs/common';
import { AssemblyController } from './assembly.controller';
import { AssemblyService } from './assembly.service';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { CookieGuard } from '../auth/cookie.guard';
import { PrismaService } from '../prisma/prisma.service';
import { WriteAssemblyProcessor } from './assembly.processor';
import { RedisModule } from '../redis/redis.module';
import { AssemblyContractProvider } from './contract.provider';
import { web3Provider } from '../blockchain/web3.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { SftpService } from '../sftp/sftp.service';

@Module({
  imports: [RedisModule, FusionAuthModule, ConfigModule, PrismaModule, BlockchainModule],
  controllers: [AssemblyController],
  providers: [AssemblyService, CookieGuard, PrismaService, WriteAssemblyProcessor, AssemblyContractProvider, web3Provider, SftpService],
})
export class AssemblyModule {}
