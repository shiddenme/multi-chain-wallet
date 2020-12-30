import { Injectable, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '../../core';

import { EthTransactionService, EthTokenService } from '../../modules';

import { sleep } from '../utils';
import * as R from 'ramda';

const Web3 = require('web3');
const BN = require('bn.js');
import { erc20AbI } from '../abi/erc20';
class parseDto {
  type: string;
  name: string;
}

@Injectable()
export class Web3Service {
  private readonly web3 = new Web3(
    new Web3.providers.HttpProvider(this.config.get('web3')['gethServer']),
  );
  public readonly sipc = new Web3(
    new Web3.providers.HttpProvider(this.config.get('web3')['sipcServer']),
  );
  public readonly slc = new Web3(
    new Web3.providers.HttpProvider(this.config.get('web3')['slcServer']),
  );
  private readonly logger = new Logger(Web3Service.name);
  public readonly web3Contract = new this.web3.eth.Contract(erc20AbI);
  public readonly sipcContract = new this.sipc.eth.Contract(erc20AbI);

  constructor(
    private readonly ethTokenService: EthTokenService,
    private readonly ethTransactionService: EthTransactionService,
    private readonly config: ConfigService,
  ) {}

  switchServer(node: string) {
    let s = null;
    switch (node) {
      case 'sipc':
        s = this.sipc;
        break;
      case 'slc':
        s = this.slc;
        break;
      case 'eth':
        s = this.web3;
        break;
      default:
        break;
    }
    return s;
  }
  // 合约地址为空：查询主流币余额
  async myBalanceOf(contract: string, wallet: string, node: string) {
    try {
      const server = this.switchServer(node);
      if (!contract || contract === '0x') {
        const value = await server.eth.getBalance(wallet);
        return value;
      }
      const myContract = new server.eth.Contract(erc20AbI);
      myContract.options.address = contract;

      return await myContract.methods.balanceOf(wallet).call();
    } catch (e) {
      console.log(e);
      throw new HttpException('节点错误', 500);
    }
  }

  async getDecimals(contract: string, f: boolean) {
    try {
      if (!contract || contract === '0x') {
        return '18';
      }
      const myContract = f ? this.web3Contract : this.sipcContract;
      myContract.options.address = contract;

      return await myContract.methods.decimals().call();
    } catch (e) {
      console.log(e);
      throw new HttpException('节点错误', 500);
    }
  }

  async getTransactionReceipt(hash: string, f: boolean) {
    const server = f ? this.web3 : this.sipc;
    return await server.eth.getTransactionReceipt(hash);
  }

  async getGasPrice(node: string) {
    try {
      const server = this.switchServer(node);
      return await server.eth.getGasPrice();
    } catch (e) {
      console.log(e);
      throw new HttpException('节点错误', 500);
    }
  }

  async setProvider(url?: string) {
    url || (url = this.config.get('web3')['gethServer']);
    try {
      await this.web3.eth.net.isListening();
    } catch (e) {
      console.log(e);
      console.log('[ - ] Lost connection to the node, reconnecting', url);
      await this.web3.setProvider(new Web3.providers.HttpProvider(url));
      await sleep(1000);
      await this.setProvider(url);
    }
  }

  async syncBlocks() {
    const number = await this.web3.eth.getBlockNumber();
    // const res = await this.ethTransactionService.findOne({
    //   attributes: ['blockNumber'],
    //   limit: 1,
    //   raw: true,
    //   order: [['blockNumber', 'desc']],
    // });
    // const blockNumber = res ? res.blockNumber : number;
    //this.listenBlock(Math.max(number, 10000000));
    this.listenBlockTransactions(number);
  }

  async listenBlockTransactions(blockNumber: number) {
    try {
      const currentHeight = await this.web3.eth.getBlockNumber();

      console.log('Get eth transaction', blockNumber);

      // 确认12个块
      if (blockNumber > currentHeight) {
        setTimeout(async () => {
          await this.listenBlockTransactions(blockNumber - 12);
        }, 1000);
        return false;
      }
      const result = await this.web3.eth.getBlock(blockNumber, true);

      const timestamp = result.timestamp;
      const queue = [];
      for (let i = 0; i < result.transactions.length; i++) {
        const transaction = result.transactions[i];
        const { input, hash, to } = transaction;
        // 跳过创建合约的交易
        if (!to) {
          continue;
        }
        const code = await this.web3.eth.getCode(to);
        transaction.contract = code === '0x' ? '0x' : to;
        const token = await this.ethTokenService.findOne({
          contract: transaction.contract,
        });
        // 跳过表中不存在的合约币交易
        if (!token) {
          continue;
        }
        const tableName = `eth_transaction_${token.sort}`;

        (input === '0x' || input.length > 50000) && (transaction.input = '0x0');
        transaction.timestamp = timestamp;
        const transactionReceipt = await this.getTransactionReceipt(
          hash.toString(),
          true,
        );
        if (!transactionReceipt) {
          continue;
        }
        const { gasUsed, logs, status } = transactionReceipt;
        transaction.gasUsed = gasUsed;
        transaction.status = status;
        // 如果是交易时间；to,value 赋值为tranfer函数的参数
        if (
          logs[0] &&
          logs[0].topics[0] === this.config.get('web3')['transferEvent']
        ) {
          try {
            const parameter = '0x' + input.slice(10);
            const result = await this.decodeParameters(
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
            if (result.value.length > 32) {
              throw new Error('未验证合约');
            }
            transaction.value = result.value;
            transaction.to = result.to;
          } catch (e) {
            continue;
          }
        }
        const transactionObj = R.pick([
          'blockHash',
          'blockNumber',
          'from',
          'gas',
          'gasPrice',
          'hash',
          'input',
          'nonce',
          'to',
          'transactionIndex',
          'value',
          'contract',
          'timestamp',
          'gasUsed',
          'status',
        ])(transaction);
        queue.push(
          this.ethTransactionService.findOrCreate(
            R.mergeRight(transactionObj, {
              from: transaction.from && transaction.from.toLowerCase(),
              to: transaction.to && transaction.to.toLowerCase(),
            }),
            tableName,
          ),
        );
      }
      await Promise.all(queue);
    } catch (e) {
      console.log('get ethTransactions error:', blockNumber, e);
      blockNumber--;
    }

    await this.listenBlockTransactions(blockNumber + 1);
  }

  getGasInBlock(transactions) {
    let length = transactions.length;
    if (length === 0) {
      return 0;
    }
    let txsFee = 0;
    for (let i = 0; i < length; i++) {
      const bigFee = new BN(transactions[i].gas).mul(
        new BN(transactions[i].gasPrice),
      );
      const fee = this.web3.utils.fromWei(bigFee);
      txsFee += parseFloat(fee);
    }
    return txsFee;
  }

  // 编码erc20交易函数
  async getTransfer(transactionObject) {
    try {
      const { to, value } = transactionObject;
      const myContract = this.web3Contract;
      const data = myContract.methods.transfer(to, value).encodeABI();

      return data;
    } catch (e) {
      console.log(e);
      throw new HttpException(e.code + ',' + e.argument, 400);
    }
  }

  decodeParameters(parse: parseDto[], input: string) {
    return this.web3.eth.abi.decodeParameters(parse, input);
  }
}
