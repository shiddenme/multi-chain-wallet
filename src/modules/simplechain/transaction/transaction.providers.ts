import * as SipcTransaction from './transaction.entity';

export const SipcTransactionProviders = Object.values(SipcTransaction).map((ele, index) => {
    return {
      provide: `sipc_transaction_repo_${index + 1}`,
      useValue: ele
    }
})
