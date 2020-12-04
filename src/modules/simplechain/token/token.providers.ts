import { Sipc_Token } from './token.entity';

export const SipcTokenProviders = [{
      provide: `sipc_token_repo`,
      useValue: Sipc_Token
    }
]
