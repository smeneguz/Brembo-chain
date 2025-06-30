// web3.provider.ts
import { Provider, Scope } from '@nestjs/common';
import axios from 'axios';
import Web3 from 'web3';

export const web3PublicProvider: Provider = {
  provide: 'WEB3_PUB',
  scope: Scope.DEFAULT,
  useFactory: async () => {
    const provider = new Web3.providers.WebsocketProvider(
      process.env.BREMBOCHAIN_PUBLIC_WS_URL!,
    );
    const web3 = new Web3(provider);

    const vaultToken = process.env.VAULT_TOKEN;
    const vaultApiUrl = process.env.VAULT_API_URL;
    const vaultSecretKeypath = process.env.VAULT_SECRET_TESTNET_KEYPATH;
    const vaultSecretKeyname = process.env.VAULT_SECRET_TESTNET_KEYNAME;

    const response = await axios.get(
      `${vaultApiUrl}/kv/data/${vaultSecretKeypath}`,
      {
        headers: {
          'X-Vault-Token': vaultToken,
          Accept: 'application/json',
        },
      },
    );

    const secret = response.data.data.data[vaultSecretKeyname];

    if (!secret) {
      throw new Error('Secret not found in vault!');
    }

    web3.eth.accounts.wallet.add(secret);
    return web3;
  },
};
