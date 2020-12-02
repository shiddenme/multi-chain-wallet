import * as ethTransaction from './transaction.entity';

export const EthTransactionProviders = Object.values(ethTransaction).map((ele, index) => {
    return {
      provide: `eth_transaction_repo_${index + 1}`,
      useValue: ele
    }
})
