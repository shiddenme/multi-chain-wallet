import { Eth_Transaction } from './transaction.entity';

export const EthTransactionProviders = [
  {
    provide: `eth_transaction_repo`,
    useValue: Eth_Transaction,
  },
];
