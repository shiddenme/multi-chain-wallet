import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Eth_Transaction } from './transaction.entity';
import { Cron } from '@nestjs/schedule';
import * as R from 'ramda';
import { Op } from 'sequelize';
import { Web3Service } from '../../../shared/services/web3.service';
import { EthTokenService } from '../token/token.service';
import * as moment from 'moment';
import { ConfigService } from '../../../core';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class EthTransactionService {
  private readonly logger = new Logger(EthTransactionService.name);

  constructor(
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly tokenService: EthTokenService,
    private readonly configService: ConfigService,
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
      where: R.mergeRight(options, foo),
      attributes: {
        exclude: ['gasUsed', 'status'],
      },
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
          gasPrice,
        } = transaction;
        let _value = value && value.toString();
        const transactionReceipt = await this.web3Service.getTransactionReceipt(
          hash.toString(),
          true,
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
        // 判断是否为交易事件
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
        return R.mergeRight(transaction, {
          cumulativeGasUsed,
          title,
          gasUsed,
          status,
          date,
          mark,
          blockHash: blockHash && blockHash.toString(),
          hash: hash && hash.toString(),
          input: input && input.toString(),
          value: _value,
          txnFee: gasPrice * gasUsed,
        });
      }),
    );

    return {
      transactions,
      count,
    };
  }

  async getTransfer(where) {
    const transfer = await this.web3Service.getTransfer(where);
    return {
      transfer,
    };
  }

  @Cron('10 * * * * *')
  async transactionDBCron() {
    await this.logger.log('create transaction table');
    const sequelize = new Sequelize(this.configService.get('sequelize'));
    const Eth_Transaction_1 = Eth_Transaction;
    sequelize.addModels([Eth_Transaction_1]);
    await sequelize.sync({
      force: false,
      alter: false,
    });
  }
}
