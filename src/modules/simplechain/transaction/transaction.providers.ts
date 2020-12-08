import { Sipc_Transaction } from './transaction.entity';

export const SipcTransactionProviders = [
  {
    provide: `sipc_transaction_repo`,
    useValue: Sipc_Transaction,
  },
];
