import { eth_uncle } from './uncle.entity';

export const EthUncleProviders = [
  {
    provide: 'eth_uncle_repo',
    useValue: eth_uncle,
  },
];
