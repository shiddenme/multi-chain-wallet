import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Eth_Transaction } from './transaction.entity';
import { fromWei } from '../../../shared/utils/tools';

import * as R from 'ramda';
import { Op } from 'sequelize';
import { Web3Service } from '../../../shared/services/web3.service';
import { EthTokenService } from '../token/token.service';
import * as moment from 'moment';
@Injectable()
export class EthTransactionService {
  constructor(
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly tokenService: EthTokenService,
    @Inject('eth_transaction_repo')
    private readonly transactionRepo: typeof Eth_Transaction,
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
    const { wallet, search, pageIndex = 0, pageSize = 10 } = where;
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

    const res = await this.transactionRepo.findAndCountAll({
      where: options,
      attributes: {
        exclude: ['gasUsed', 'status'],
      },
      raw: true,
      order: [['timestamp', 'desc']],
      limit: Number(pageSize),
      offset: Number(pageIndex) * Number(pageSize),
    });
    const { rows, count } = res;
    const transactions = await Promise.all(
      rows.map(async (transaction) => {
        const {
          hash,
          from,
          to,
          blockHash,
          value,
          input,
          timestamp,
        } = transaction;
        const transactionReceipt = await this.web3Service.getTransactionReceipt(
          hash.toString(),
          true,
        );
        const date = timestamp
          ? moment(timestamp * 1000).format('YYYY-MM-DD hh:mm:ss')
          : '';
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
          input: input && input.toString(),
          from: from && from.toString(),
          to: to && to.toString(),
          value: fromWei(value && value.toString(), 'ether'),
        });
      }),
    );

    return {
      transactions,
      count,
    };
  }
}
