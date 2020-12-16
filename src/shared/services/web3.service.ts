import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '../../core';

import {
  EthBlockService,
  EthUncleService,
  EthTransactionService,
} from '../../modules';

import {
  sleep,
  getConstReward,
  getFoundationPercent,
  getUncleReward,
  getRewardForUncle,
} from '../utils';
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

  public readonly web3Contract = new this.web3.eth.Contract(erc20AbI);
  public readonly sipcContract = new this.sipc.eth.Contract(erc20AbI);

  constructor(
    private readonly ethBlcokService: EthBlockService,
    private readonly ethUncleService: EthUncleService,
    private readonly ethTransactionService: EthTransactionService,
    private readonly config: ConfigService,
  ) {}

  // 合约地址为空：查询主流币余额
  async myBalanceOf(contract: string, wallet: string, f: boolean) {
    try {
      if (!contract || contract === '0x') {
        const server = f ? this.web3 : this.sipc;
        const value = await server.eth.getBalance(wallet);
        return value;
      }
      const myContract = f ? this.web3Contract : this.sipcContract;
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

  async getGasPrice(f: boolean) {
    try {
      const server = f ? this.web3 : this.sipc;
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
      await sleep(this.config.get('web3')['reconnect']);
      await this.setProvider(url);
    }
  }

  async listenBlock(blockNumber: number) {
    try {
      if (blockNumber % 10 === 0) {
        console.log('Get eth block ', blockNumber);
      }
      const currentHeight = await this.web3.eth.getBlockNumber();

      if (blockNumber > currentHeight) {
        //confirm 20 blocks;
        setTimeout(async () => {
          await this.listenBlock(blockNumber - 12);
        }, 1000);
        return false;
      }
      const result = await this.web3.eth.getBlock(blockNumber, true);
      if (R.isNil(result)) {
        return false;
      }

      result.extraData === '0x' && (result.extraData = '0x0');
      const reward = getConstReward(result.number);

      const minerReward = reward * (1 - getFoundationPercent(result.number));
      const foundation = reward * getFoundationPercent(result.number);
      const txnFees = this.getGasInBlock(result.transactions);
      const unclesCount = result.uncles.length;
      const uncleInclusionRewards = getRewardForUncle(
        result.number,
        unclesCount,
      );
      result.extraData.length > 5000 && (result.extraData = '0x0');

      const options = R.pick([
        'number',
        'difficulty',
        'extraData',
        'gasLimit',
        'gasUsed',
        'hash',
        'logsBloom',
        'miner',
        'mixHash',
        'nonce',
        'parentHash',
        'receiptsRoot',
        'sha3Uncles',
        'size',
        'stateRoot',
        'totalDifficulty',
        'timestamp',
        'transactionsRoot',
      ])(result);

      await this.ethBlcokService.findOrCreate(
        R.mergeRight(options, {
          unclesCount,
          minerReward,
          foundation,
          txnFees,
          uncleInclusionRewards,
        }),
      );
      // await setHashRate(result.number, result.timestamp)

      if (result.uncles.length > 0) {
        const count = await this.web3.eth.getBlockUncleCount(blockNumber);
        for (let i = 0; i < count; i++) {
          const uncle = await this.web3.eth.getUncle(blockNumber, i);
          uncle.extraData === '0x' && (uncle.extraData = '0x0');

          const uncleReward = getUncleReward(uncle.number, blockNumber, reward);
          uncle.extraData.length > 5000 && (uncle.extraData = '0x0');
          const uncleObj = R.pick([
            'number',
            'extraData',
            'gasLimit',
            'gasUsed',
            'hash',
            'logsBloom',
            'miner',
            'mixHash',
            'nonce',
            'parentHash',
            'receiptsRoot',
            'sha3Uncles',
            'size',
            'stateRoot',
            'timestamp',
            'transactionsRoot',
          ])(uncle);
          await this.ethUncleService.findOrCreate(
            R.mergeRight(uncleObj, {
              blockNumber,
              uncleIndex: i,
              reward: uncleReward,
            }),
          );
        }
      }
    } catch (e) {
      console.log('get ethBlock error:', blockNumber, e);
      blockNumber--;
    }
    await sleep(500);
    await this.listenBlock(blockNumber + 1);
  }

  async syncBlocks() {
    const number = await this.web3.eth.getBlockNumber();
    const res = await this.ethTransactionService.findOne({
      attributes: ['blockNumber'],
      limit: 1,
      raw: true,
      order: [['blockNumber', 'desc']],
    });
    const blockNumber = res ? res.blockNumber : 11457187;
    //this.listenBlock(Math.max(number, 10000000));
    this.listenBlockTransactions(number);
  }

  async listenBlockTransactions(blockNumber: number) {
    try {
      const currentHeight = await this.web3.eth.getBlockNumber();

      console.log('Get ETHEREUM transaction', blockNumber);

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
        if (to) {
          const code = await this.web3.eth.getCode(to);
          transaction.contract = code === '0x' ? '0x' : to;
        }
        (input === '0x' || input.length > 50000) && (transaction.input = '0x0');
        transaction.timestamp = timestamp;
        const transactionReceipt = await this.getTransactionReceipt(
          hash.toString(),
          true,
        );
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
