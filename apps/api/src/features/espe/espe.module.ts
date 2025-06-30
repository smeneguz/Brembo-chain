import { Module } from '@nestjs/common';
import { EspeService } from './espe.service';
import { EspeController } from './espe.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CookieGuard } from '../auth/cookie.guard';
import { FusionAuthModule } from '../fusionauth/fusionauth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { web3Provider } from '../blockchain/web3.provider';
import { EspeContractProvider } from './contract.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { SftpService } from '../sftp/sftp.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [FusionAuthModule, ConfigModule, PrismaModule, BlockchainModule],
  controllers: [EspeController],
  providers: [
    EspeService,
    CookieGuard,
    PrismaService,
    EspeContractProvider,
    web3Provider,
    SftpService,
    RolesGuard,
  ],
})
export class EspeModule {}
