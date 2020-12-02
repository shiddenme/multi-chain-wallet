import { Injectable, Inject } from '@nestjs/common';
import { Eth_Transaction_1,Eth_Transaction_2,Eth_Transaction_3 } from './transaction.entity';
import { whickTransacionRepo } from '../../../shared/utils/tools'

@Injectable()
export class EthTransactionService {
  
  constructor(
    @Inject('eth_transaction_repo_1') private readonly transactionRepo1: typeof Eth_Transaction_1,
    @Inject('eth_transaction_repo_2') private readonly transactionRepo2: typeof Eth_Transaction_2,
    @Inject('eth_transaction_repo_3') private readonly transactionRepo3: typeof Eth_Transaction_3,
  ) { }
  private readonly repoList = [this.transactionRepo1, this.transactionRepo2, this.transactionRepo3]

  // todo: 为插入选项options 创建 DTO
  async findOne(options, repo) { 
    return await repo.findOne(options)
  }

  async findOrCreate(options) { 
    const index = whickTransacionRepo(options.blockNumber);
    const repo = this.repoList[index - 1];
    return await repo.findOrCreate({
      where: { hash: options.hash },
      defaults: options,
      logging:false
    })
  }
}