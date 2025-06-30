// contract.provider.ts
import { Provider } from '@nestjs/common';
import Web3 from 'web3';
import Contract from '@brembochain/contracts/build/contracts/StatorProcessTracker.json';

export const StatorContractProvider: Provider = {
  provide: 'CONTRACT',
  useFactory: (web3: Web3) => {
    return new web3.eth.Contract(Contract.abi as any, process.env.STATOR_CONTRACT_ADDRESS!);
  },
  inject: ['WEB3'],
};
