import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { SIPC_Transaction } from './transaction.entity';
import * as R from 'ramda';
import { Op } from 'sequelize';
import { Web3Service } from '../../../shared/services/web3.service';
import { SipcBlockService } from '../block/block.service';
import { SipcTokenService } from '../token/token.service';

@Injectable()
export class SipcTransactionService {
  constructor(
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly blockService: SipcBlockService,
    private readonly tokenService: SipcTokenService,
    @Inject('sipc_transaction_repo')
    private readonly transactionRepo: typeof SIPC_Transaction,
  ) {}

  // todo: 为插入选项options 创建 DTO
  async findOne(options) {
    return await this.transactionRepo.findOne(options);
  }

  async findOrCreate(options) {
    return await this.transactionRepo.findOrCreate({
      where: { hash: options.hash },
      defaults: options,
      logging: false,
    });
  }

  async findTransactionByBlockNumber(blockNumber: number) {
    return await this.transactionRepo.findAll({
      where: {
        blockNumber,
      },
      raw: true,
    });
  }

  async findAll(where) {
    const { wallet, search } = where;
    let options: any;
    if (search === 'from') {
      options = {
        from: wallet,
      };
    } else if (search === 'to') {
      options = {
        to: wallet,
      };
    } else {
      options = {
        [Op.or]: [{ from: wallet }, { to: wallet }],
      };
    }

    const res = await this.transactionRepo.findAll({
      where: options,
      attributes: {
        exclude: ['gasUsed', 'status'],
      },
      raw: true,
    });
    const transactions = await Promise.all(
      res.map(async (transaction) => {
        const {
          hash,
          blockNumber,
          from,
          to,
          blockHash,
          value,
          input,
        } = transaction;

        const transactionReceipt = await this.web3Service.getTransactionReceipt(
          hash.toString(),
        );
        const date = await this.blockService.findBlockTimeStamp(blockNumber);
        const token = await this.tokenService.findOne({
          contract: to.toString(),
        });
        const symbol = token ? token.symbol : 'ETH';

        let mark: number = 1;
        if (from.toString() === wallet) {
          mark = -1;
        }
        const { cumulativeGasUsed, gasUsed, status } = transactionReceipt;
        return R.mergeRight(transaction, {
          cumulativeGasUsed,
          gasUsed,
          status,
          date,
          symbol,
          mark,
          blockHash: blockHash && blockHash.toString(),
          hash: hash && hash.toString(),
          from: from && from.toString(),
          to: to && to.toString(),
          value: value && value.toString(),
          input: input && input.toString(),
        });
      }),
    );

    return {
      transactions,
    };
  }
}
