import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { eth_transaction } from './transaction.entity';
import * as R from 'ramda';

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
    private readonly transactionRepo: typeof eth_transaction,
    @Inject('SEQUELIZE')
    private readonly sequelize,
  ) {}

  // todo: 为插入选项options 创建 DTO
  async findOne(options) {
    return await this.transactionRepo.findOne(options);
  }

  async findOrCreate(options, tableName: string) {
    const {
      blockHash,
      blockNumber,
      from,
      gas,
      gasPrice,
      hash,
      input,
      nonce,
      to,
      transactionIndex,
      value,
      contract,
      timestamp,
      gasUsed,
      status,
    } = options;
    const sql = `replace into ${tableName} values('${blockHash}',${blockNumber},'${hash}','${from}',
    ${gas},${gasUsed},${gasPrice},'${input}',${nonce},'${to}',
    ${transactionIndex},'${value}','${contract}',${timestamp},${status})`;
    await this.sequelize.query(sql, {
      logging: false,
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
    const limit = Number(pageSize);
    const offset = pageIndex < 1 ? 0 : Number(pageIndex - 1) * Number(pageSize);

    const tableName = `eth_transaction_${token.sort}`;
    const sql_from = `select * from ${tableName} where \`from\` = '${wallet}' order by timestamp desc limit ${
      offset + limit
    }`;
    const sql_to = `select * from ${tableName} where \`to\` = '${wallet}' order by timestamp desc limit ${
      offset + limit
    }`;
    const res_from = await this.sequelize.query(sql_from, {
      raw: true,
    });
    const res_to = await this.sequelize.query(sql_to, {
      raw: true,
    });
    let res: eth_transaction[];
    let condition = ' 1 = 1';
    if (search === 'from') {
      condition += ` and \`from\` = '${wallet}'`;
      res = res_from[0].slice(offset, offset + limit);
    } else if (search === 'to') {
      condition += ` and \`to\` = '${wallet}'`;
      res = res_to[0].slice(offset, offset + limit);
    } else {
      condition += ` and (\`from\` = '${wallet}' or \`to\` = '${wallet}')`;
      res = res_from[0].concat(res_to[0]).slice(offset, offset + limit);
    }
    const sql_count = `select count(1) as count from ${tableName} where ${condition}`;

    const res1 = await this.sequelize.query(sql_count, { raw: true });
    const transactions = await Promise.all(
      res.map(async (transaction) => {
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
      count: res1[0][0].count,
    };
  }

  async getTransfer(where) {
    const transfer = await this.web3Service.getTransfer(where);
    return {
      transfer,
    };
  }
}
