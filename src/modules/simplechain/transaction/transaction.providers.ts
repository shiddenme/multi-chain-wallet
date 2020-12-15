import { sipc_transaction } from './transaction.entity';

export const SipcTransactionProviders = [
  {
    provide: `sipc_transaction_repo`,
    useValue: sipc_transaction,
  },
];
