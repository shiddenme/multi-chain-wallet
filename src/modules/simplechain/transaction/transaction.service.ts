import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { sipc_transaction, slc_transaction } from './transaction.entity';
import * as R from 'ramda';
import { Op } from 'sequelize';

import { SipcTokenService } from '../token/token.service';
import * as moment from 'moment';
@Injectable()
export class SipcTransactionService {
  constructor(
    private readonly tokenService: SipcTokenService,
    @Inject('sipc_transaction_repo')
    private readonly transactionRepo: typeof sipc_transaction,
    @Inject('slc_transaction_repo')
    private readonly slcTransactionRepo: typeof slc_transaction,
  ) {}

  // todo: 为插入选项options 创建 DTO
  async findOne(options, node: string) {
    const repo =
      node === 'sipc' ? this.transactionRepo : this.slcTransactionRepo;
    return await repo.findOne(options);
  }

  async findOrCreate(options, node: string) {
    const repo =
      node === 'sipc' ? this.transactionRepo : this.slcTransactionRepo;
    return await repo.findOrCreate({
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
    const { wallet, pageIndex = 1, pageSize = 10, name } = where;
    let search = where.search;
    const token = await this.tokenService.findOne({
      name,
    });
    if (!token) {
      throw new HttpException('代币不存在', 400);
    }
    const repo =
      token.symbol === 'SLC' ? this.slcTransactionRepo : this.transactionRepo;
    // todo :address 存redis
    const corssAddress = [
      '0xf7bea9e8a0c8e99af6e52ff5e41ec9cac6e6c314',
      '0x9363611fb9b9b2d6f731963c2ffa6cecf2ec0886',
    ];
    const limit = Number(pageSize);
    const offset = pageIndex < 1 ? 0 : Number(pageIndex - 1) * Number(pageSize);
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

    const res = await repo.findAndCountAll({
      where: R.mergeRight(options, {
        contract: token.contract || '0x',
      }),
      raw: true,
      order: [['timestamp', 'desc']],
      limit,
      offset,
    });
    const { rows, count } = res;

    const transactions = await Promise.all(
      rows.map(async (transaction) => {
        const {
          hash,
          blockHash,
          value,
          input,
          timestamp,
          to,
          status,
          gasUsed,
          gasPrice,
        } = transaction;

        const date = timestamp
          ? moment(timestamp * 1000)
              .utcOffset(480)
              .format('YYYY-MM-DD HH:mm:ss')
          : '';
        let title: string;
        let mark = '-';
        if (to === wallet) {
          title = '收款';
          mark = '+';
        } else if (corssAddress.includes(to)) {
          title = '跨链';
        } else {
          title = '支付';
        }
        if (search === 'from') {
          mark = '-';
        } else if (search === 'to') {
          mark = '+';
        }

        return R.mergeRight(transaction, {
          title,
          gasUsed,
          status: Boolean(status),
          date,
          mark,
          blockHash: blockHash && blockHash.toString(),
          hash: hash && hash.toString(),
          input: input && input.toString(),
          value: value.toString(),
          txnFee: gasPrice * gasUsed,
        });
      }),
    );

    return {
      transactions,
      count,
    };
  }
}
