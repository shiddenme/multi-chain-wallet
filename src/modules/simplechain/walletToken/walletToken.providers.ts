import { Sipc_Wallet_Token } from './walletToken.entity';

export const SipcWalletTokenProviders = [{
      provide: `sipc_wallet_token_repo`,
      useValue: Sipc_Wallet_Token
    }
]
