import { Module } from '@nestjs/common';
import { BrakeController } from './brake.controller';
import { BrakeService } from './brake.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { BrakeContractProvider } from './contract.provider';
import { web3PublicProvider } from '../blockchain/web3.public.provider';
import { EspeModule } from '../espe/espe.module';
import { EspeService } from '../espe/espe.service';
import { SftpService } from '../sftp/sftp.service';
import { ConfigModule } from '@nestjs/config';
import { web3Provider } from '../blockchain/web3.provider';
import { EspeContractProvider } from '../espe/contract.provider';

@Module({
  imports: [PrismaModule, BlockchainModule, EspeModule, ConfigModule],
  controllers: [BrakeController],
  providers: [
    BrakeService,
    PrismaService,
    SftpService,
    BrakeContractProvider,
    web3PublicProvider,
    EspeContractProvider,
    web3Provider,
    EspeService,
    SftpService,
  ],
})
export class BrakeModule {}
