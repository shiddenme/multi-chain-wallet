import { Sipc_Uncle } from './uncle.entity';

export const SipcUncleProviders = [
    {
      provide: 'sipc_uncle_repo',
      useValue: Sipc_Uncle
    }
]
