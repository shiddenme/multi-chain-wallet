import { Eth_Uncle } from './uncle.entity';

export const EthUncleProviders = [
    {
      provide: 'eth_uncle_repo',
      useValue: Eth_Uncle
    }
]
