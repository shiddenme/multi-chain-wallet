import { sipc_transaction, slc_transaction } from './transaction.entity';

export const SipcTransactionProviders = [
  {
    provide: `sipc_transaction_repo`,
    useValue: sipc_transaction,
  },

  {
    provide: `slc_transaction_repo`,
    useValue: slc_transaction,
  },
];
