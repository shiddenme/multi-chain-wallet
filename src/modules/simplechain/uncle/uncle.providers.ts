import { sipc_uncle } from './uncle.entity';

export const SipcUncleProviders = [
  {
    provide: 'sipc_uncle_repo',
    useValue: sipc_uncle,
  },
];
