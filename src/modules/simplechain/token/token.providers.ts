import { sipc_token } from './token.entity';

export const SipcTokenProviders = [
  {
    provide: `sipc_token_repo`,
    useValue: sipc_token,
  },
];
