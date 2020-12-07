import { Eth_Asset } from './asset.entity';

export const EthWalletTokenProviders = [
  {
    provide: `eth_wallet_token_repo`,
    useValue: Eth_Asset,
  },
];
