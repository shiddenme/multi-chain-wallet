import { eth_token } from './token.entity';

export const EthTokenProviders = [
  {
    provide: `eth_token_repo`,
    useValue: eth_token,
  },
];
