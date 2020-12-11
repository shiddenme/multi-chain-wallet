import {
  Injectable,
  Inject,
  forwardRef,
  HttpException,
  HttpService,
} from '@nestjs/common';
import { Eth_Transaction } from './transaction.entity';
import { fromWei } from '../../../shared/utils/tools';

import * as R from 'ramda';
import { Op } from 'sequelize';
import { Web3Service } from '../../../shared/services/web3.service';
import { EthTokenService } from '../token/token.service';
import { erc20AbI } from '../../../shared/abi/erc20';
import * as moment from 'moment';
@Injectable()
export class EthTransactionService {
  constructor(
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly httpService: HttpService,
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

    const result = await this.httpService
      .get('https://explorer.simplechain.com/api/cross/token/list')
      .toPromise();
    const corssAddress = R.map(R.prop('crossAddress'))(result.data);
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
    const { rows, count } = res;
    const transactions = await Promise.all(
      rows.map(async (transaction) => {
        const {
          hash,
          from,
          blockHash,
          value,
          input,
          timestamp,
          to,
        } = transaction;
        const transactionReceipt = await this.web3Service.getTransactionReceipt(
          hash.toString(),
          true,
        );
        const date = timestamp
          ? moment(timestamp * 1000).format('YYYY-MM-DD hh:mm:ss')
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
        const { cumulativeGasUsed, gasUsed, status } = transactionReceipt;
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
          value: fromWei(value && value.toString(), 'ether'),
        });
      }),
    );

    return {
      transactions,
      count,
    };
  }

  async getTransfer(where) {
    const transfer = await this.web3Service.getTransfer(where, true);
    return {
      transfer,
    };
  }
}
