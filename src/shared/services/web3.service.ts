import { Injectable } from '@nestjs/common';
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
import { fromWei } from '../utils/tools';
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
  async myBalanceOf(contract, wallet, f: boolean) {
    if (!contract) {
      const server = f ? this.web3 : this.sipc;
      const value = await server.eth.getBalance(wallet);
      return f ? fromWei(value, 'ether') : value;
    }
    const myContract = f ? this.web3Contract : this.sipcContract;
    myContract.options.address = contract;

    return await myContract.methods.balanceOf(wallet).call();
  }

  async getTransactionReceipt(hash: string, f: boolean) {
    const link = f ? this.web3 : this.sipc;
    return await link.eth.getTransactionReceipt(hash);
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

  async listenBlock(blockNumber) {
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
    await this.listenBlock(blockNumber + 1);
  }

  async syncBlocks() {
    const number = await this.web3.eth.getBlockNumber();
    console.log('start block:', number);
    this.listenBlock(Math.max(number, 10000000));
    this.listenBlockTransactions(number);
  }

  async listenBlockTransactions(blockNumber) {
    try {
      const currentHeight = await this.web3.eth.getBlockNumber();
      if (blockNumber > currentHeight) {
        setTimeout(async () => {
          await this.listenBlockTransactions(blockNumber);
        }, 1000);
        return false;
      }
      const result = await this.web3.eth.getBlock(blockNumber, true);
      if (R.isNil(result)) {
        return false;
      }
      const timestamp = result.timestamp;
      const queue = [];
      for (let i = 0; i < result.transactions.length; i++) {
        const transaction = result.transactions[i];

        (transaction.input === '0x' || transaction.input.length > 50000) &&
          (transaction.input = '0x0');
        transaction.timestamp = timestamp;
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
          'timestamp',
        ])(transaction);
        queue.push(this.ethTransactionService.findOrCreate(transactionObj));
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
}
