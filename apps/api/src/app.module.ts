import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { AuthModule } from './features/auth/auth.module';
import { FusionAuthModule } from './features/fusionauth/fusionauth.module';
import { PrismaModule } from './features/prisma/prisma.module';
import { StatorModule } from './features/stator/stator.module';
import { RotorModule } from './features/rotor/rotor.module';
import { AssemblyModule } from './features/assembly/assembly.module';
import { EspeModule } from './features/espe/espe.module';

import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModuleCustom } from './features/bull/bull.module';
import { RedisModule } from './features/redis/redis.module';
import { BlockchainModule } from './features/blockchain/blockchain.module';
import { VerificationModule } from './features/verification/verification.module';
import { TxamountModule } from './features/txamount/txamount.module';
import { SftpService } from './features/sftp/sftp.service';
import { BrakeModule } from './features/brake/brake.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
    }),

    ScheduleModule.forRoot(),
    PrismaModule,
    FusionAuthModule,
    AuthModule,
    BullModuleCustom,
    RedisModule,
    StatorModule,
    RotorModule,
    AssemblyModule,
    EspeModule,
    VerificationModule,
    BlockchainModule,
    TxamountModule,
    BrakeModule,
  ],
  providers: [BullModuleCustom, BullModule, RedisModule, SftpService],
})
export class AppModule {}
