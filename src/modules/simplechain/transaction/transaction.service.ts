import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpService,
} from '@nestjs/common';
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
    private readonly httpService: HttpService,
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
      where: R.mergeRight(options, foo),
      attributes: {
        exclude: ['gasUsed', 'status'],
      },
      raw: true,
      order: [['timestamp', 'desc']],
      limit,
      offset,
    });
    const result = await this.httpService
      .get('https://explorer.simplechain.com/api/cross/token/list')
      .toPromise();
    const corssAddress = R.map(R.prop('crossAddress'))(result.data);
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
          false,
        );
        const date = timestamp
          ? moment(timestamp * 1000).format('YYYY-MM-DD hh:mm:ss')
          : '';
        let title: string;
        if (to === wallet) {
          title = '收款';
        } else if (corssAddress.includes(to)) {
          title = '跨链';
        } else {
          title = '支付';
        }
        const token = await this.tokenService.findOne({
          contract: to.toString(),
        });
        const symbol = token ? token.symbol : 'SIPC';

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
          title,
          blockHash: blockHash && blockHash.toString(),
          hash: hash && hash.toString(),
          input: input && input.toString(),
          value: value.toString(),
        });
      }),
    );

    return {
      transactions,
      count,
    };
  }
}
