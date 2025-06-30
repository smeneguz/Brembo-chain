import { Module } from '@nestjs/common';
import { BullService } from './bull.service';
import { CronJobService } from './cron-job.service';
import { ManageDataProcessor } from './manageData.processor';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import { StatorModule } from '../stator/stator.module';
import { StatorService } from '../stator/stator.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { web3Provider } from '../blockchain/web3.provider';
import { RotorService } from '../rotor/rotor.service';
import { RotorModule } from '../rotor/rotor.module';
import { AssemblyModule } from '../assembly/assembly.module';
import { AssemblyService } from '../assembly/assembly.service';
import { StatorContractProvider } from '../stator/contract.provider';
import { SftpService } from '../sftp/sftp.service';

@Module({
  controllers: [],
  imports: [
    RedisModule,
    ConfigModule,
    PrismaModule,
    StatorModule,
    RotorModule,
    AssemblyModule,
    BlockchainModule,
    BullModule.registerQueue(
      {
        name: 'transferQueue', //xmlToJsonQueue old name
      },
      {
        name: 'statorQueue', // insert Stator data in db and blockchain
      },
      {
        name: 'rotorQueue', // insert Rotor data in db and blockchain
      },
      {
        name: 'assemblyQueue', // insert Assembly data in db and blockchain
      },
    ),
  ],
  providers: [
    CronJobService,
    BullService,
    ManageDataProcessor,
    StatorService,
    RotorService,
    AssemblyService,
    web3Provider,
    StatorContractProvider,
    SftpService
  ],
  exports: [],
})
export class BullModuleCustom {}
