import { Sipc_Asset } from './asset.entity';

export const SipcWalletTokenProviders = [
  {
    provide: `sipc_wallet_token_repo`,
    useValue: Sipc_Asset,
  },
];
