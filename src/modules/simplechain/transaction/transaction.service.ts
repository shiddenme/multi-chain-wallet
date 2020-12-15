import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { Sipc_Transaction } from './transaction.entity';
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
    private readonly transactionRepo: typeof Sipc_Transaction,
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
    let foo: any;
    // 如果合约地址为空；则查询主流币交易记录
    if (token.contract === '') {
      foo = {
        type: 'EOA',
      };
    } else {
      search = 'from';
      foo = {
        to: token.contract,
        type: 'CALL',
      };
    }

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
      where: R.mergeRight(options, foo),
      attributes: {
        exclude: ['gasUsed', 'status'],
      },
      raw: true,
      order: [['timestamp', 'desc']],
      limit,
      offset,
    });

    // todo 用redis存储
    const corssAddress = [
      '0xf7bea9e8a0c8e99af6e52ff5e41ec9cac6e6c314',
      '0x9363611fb9b9b2d6f731963c2ffa6cecf2ec0886',
    ];
    const { rows, count } = res;
    const transactions = await Promise.all(
      rows.map(async (transaction) => {
        const {
          hash,
          to,
          blockHash,
          value,
          input,
          timestamp,
          gasPrice,
          type,
        } = transaction;
        let _value = value && value.toString();
        const transactionReceipt = await this.web3Service.getTransactionReceipt(
          hash.toString(),
          false,
        );
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
        const { cumulativeGasUsed, gasUsed, status, logs } = transactionReceipt;
        if (
          logs[0] &&
          logs[0].topics[0] ===
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        ) {
          const parameter = '0x' + input.toString().slice(10);
          const result = await this.web3Service.decodeParameters(
            [
              {
                type: 'address',
                name: 'to',
              },
              {
                type: 'uint256',
                name: 'value',
              },
            ],
            parameter,
          );
          _value = result.value;
        }
        const contract = type === 'EOA' ? '' : to;
        const decimals = await this.web3Service.getDecimals(contract, true);
        return R.mergeRight(transaction, {
          cumulativeGasUsed,
          gasUsed,
          status,
          date,
          mark,
          title,
          blockHash: blockHash && blockHash.toString(),
          hash: hash && hash.toString(),
          input: input && input.toString(),
          value: _value,
          txnFee: gasPrice * gasUsed,
          decimals,
        });
      }),
    );

    return {
      transactions,
      count,
    };
  }
}
