import { eth_transaction } from './transaction.entity';

export const EthTransactionProviders = [
  {
    provide: `eth_transaction_repo`,
    useValue: eth_transaction,
  },
];
