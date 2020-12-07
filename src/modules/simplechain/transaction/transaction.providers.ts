import { SIPC_Transaction } from './transaction.entity';

export const SipcTransactionProviders = [
  {
    provide: `sipc_transaction_repo`,
    useValue: SIPC_Transaction,
  },
];
