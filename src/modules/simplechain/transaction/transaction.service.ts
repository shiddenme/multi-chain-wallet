import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { sipc_transaction } from './transaction.entity';
import * as R from 'ramda';
import { Op } from 'sequelize';
import { Web3Service } from '../../../shared/services/web3.service';

import { SipcTokenService } from '../token/token.service';
import * as moment from 'moment';
@Injectable()
export class SipcTransactionService {
  constructor(
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly tokenService: SipcTokenService,
    @Inject('sipc_transaction_repo')
    private readonly transactionRepo: typeof sipc_transaction,
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
    const { wallet, pageIndex = 1, pageSize = 10, name } = where;
    let search = where.search;
    const token = await this.tokenService.findOne({
      name,
    });
    if (!token) {
      throw new HttpException('代币不存在', 400);
    }

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
        to: {
          [Op.not]: null,
        },
      };
    } else if (search === 'to') {
      options = {
        from: {
          [Op.not]: null,
        },
        to: wallet,
      };
    } else {
      options = {
        [Op.or]: [{ from: wallet }, { to: wallet }],
      };
    }

    const res = await this.transactionRepo.findAndCountAll({
      where: R.mergeRight(options, {
        contract: token.contract,
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
