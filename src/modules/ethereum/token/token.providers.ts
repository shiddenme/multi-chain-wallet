import { Eth_Token } from './token.entity';

export const EthTokenProviders = [{
      provide: `eth_token_repo`,
      useValue: Eth_Token
    }
]
