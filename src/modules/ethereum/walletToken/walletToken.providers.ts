import { Eth_Wallet_Token } from './walletToken.entity';

export const EthWalletTokenProviders = [{
      provide: `eth_wallet_token_repo`,
      useValue: Eth_Wallet_Token
    }
]
