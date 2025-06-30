import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { BlockchainController } from './blockchain.controller';
import { web3Provider } from './web3.provider';


@Module({
  imports: [ConfigModule],
  // controllers: [BlockchainController],
  providers: [web3Provider],
  exports: [web3Provider]
})
export class BlockchainModule {}

// esportare solo web3 mentre i singoli contratti sono esportati separatamente nei moduli relativi stator.contract sotto Statore stessa