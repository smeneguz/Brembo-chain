import { Provider } from '@nestjs/common';
import Web3 from 'web3';
import Contract from '@brembochain/contracts-public/build/contracts/SupplyChainContract.json';

export const BrakeContractProvider: Provider = {
  provide: 'CONTRACT_BRAKE',
  useFactory: (web3: Web3) => {
    return new web3.eth.Contract(
      Contract.abi as any,
      process.env.BRAKE_CONTRACT_ADDRESS!,
    );
  },
  inject: ['WEB3_PUB'],
};
