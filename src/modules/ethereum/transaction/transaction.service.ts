import { Injectable, Inject } from '@nestjs/common';
import {
  Eth_Transaction_1, Eth_Transaction_2, Eth_Transaction_3,
  Eth_Transaction_4, Eth_Transaction_5, Eth_Transaction_6
} from './transaction.entity';
import { whickTransacionRepo } from '../../../shared/utils/tools'

import { findTransactionDto } from './dto/find.dto'
import * as R from 'ramda'


@Injectable()
export class EthTransactionService {
  
  constructor(
    @Inject('eth_transaction_repo_1') private readonly transactionRepo1: typeof Eth_Transaction_1,
    @Inject('eth_transaction_repo_2') private readonly transactionRepo2: typeof Eth_Transaction_2,
    @Inject('eth_transaction_repo_3') private readonly transactionRepo3: typeof Eth_Transaction_3,
    @Inject('eth_transaction_repo_4') private readonly transactionRepo4: typeof Eth_Transaction_4,
    @Inject('eth_transaction_repo_5') private readonly transactionRepo5: typeof Eth_Transaction_5,
    @Inject('eth_transaction_repo_6') private readonly transactionRepo6: typeof Eth_Transaction_6,
  ) { }
  private readonly repoList = [
    this.transactionRepo1, this.transactionRepo2, this.transactionRepo3,
    this.transactionRepo4, this.transactionRepo5, this.transactionRepo6
  ]

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

  async findTransactionByBlockNumber(blockNumber:number) { 
    const index = whickTransacionRepo(blockNumber);
    const repo = this.repoList[index - 1];
    return await repo.findAll({
      where: {
        blockNumber
      },
      raw:true
    })
  }

  // 查找当前最大交易库中最大的区块号
  async findLargestBlockNumber() { 
    for (let index = this.repoList.length - 1; index > -1; index--) {
      const element = this.repoList[index];
      const block = await this.findOne({
        order: [['blockNumber', 'desc']],
        raw: true
      }, element);
      if (block) { 
        return block.blockNumber
      }
    }
    return 0
  }

   // 查找当前最大交易库中最小的区块号
   async findSmallestBlockNumber() { 
    for (let index = 0; index < this.repoList.length; index++) {
      const element = this.repoList[index];
      const block = await this.findOne({
        order: [['blockNumber', 'asc']],
        raw: true
      }, element);
      if (block) { 
        return block.blockNumber
      }
    }
    return 0
  }


  async findAll(where: findTransactionDto) {
    const transactions = await Promise.all(this.repoList.map(async (ele) => {
      return await ele.findAll({
        where: R.pick(['from', 'to'])(where),
        attributes: {
          exclude: ['gasUsed', 'status']
        },
        raw: true
      })
    }));
    const data = R.flatten(transactions.filter(ele => { 
      return ele.length
    })).map(item => { 
      return R.mergeRight(item, {
        blockHash: item.blockHash.toString(),
        hash: item.hash.toString(),
        from: item.from.toString(),
        to: item.to.toString(),
        value: item.value.toString(),
        input: item.input.toString(),
      })
    })
    return {
      data
    }
  }
}