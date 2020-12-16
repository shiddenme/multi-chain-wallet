import { Injectable } from '@nestjs/common';

import {
  SipcBlockService,
  SipcUncleService,
  SipcTransactionService,
} from '../../modules';

import {
  sleep,
  getConstReward,
  getFoundationPercent,
  getUncleReward,
  getRewardForUncle,
} from '../utils';
import * as R from 'ramda';
import { ConfigService } from '../../core';
const Web3 = require('web3');

import { Web3Service } from './web3.service';

@Injectable()
export class SipcService {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly sipcBlcokService: SipcBlockService,
    private readonly sipcUncleService: SipcUncleService,
    private readonly sipcTransactionService: SipcTransactionService,
    private readonly config: ConfigService,
  ) {}

  async setProvider() {
    try {
      await this.web3Service.sipc.eth.net.isListening();
    } catch (e) {
      console.log(e);
      console.log(
        '[ - ] Lost connection to the node, reconnecting',
        this.config.get('web3')['sipcServer'],
      );
      await this.web3Service.sipc.setProvider(
        new Web3.providers.HttpProvider(this.config.get('web3')['sipcServer']),
      );
      await sleep(this.config.get('web3')['reconnect']);
      await this.setProvider();
    }
  }

  async listenBlock(blockNumber) {
    try {
      if (blockNumber % 10 === 0) {
        console.log('Get sipc block ', blockNumber);
      }
      const currentHeight = await this.web3Service.sipc.eth.getBlockNumber();

      if (blockNumber > currentHeight) {
        //confirm 20 blocks;
        setTimeout(async () => {
          await this.listenBlock(blockNumber - 12);
        }, 1000);
        return false;
      }
      const result = await this.web3Service.sipc.eth.getBlock(
        blockNumber,
        true,
      );
      if (R.isNil(result)) {
        return false;
      }

      result.extraData === '0x' && (result.extraData = '0x0');
      const reward = getConstReward(result.number);

      const minerReward = reward * (1 - getFoundationPercent(result.number));
      const foundation = reward * getFoundationPercent(result.number);
      const txnFees = this.web3Service.getGasInBlock(result.transactions);
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

      await this.sipcBlcokService.findOrCreate(
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
        const count = await this.web3Service.sipc.eth.getBlockUncleCount(
          blockNumber,
        );
        for (let i = 0; i < count; i++) {
          const uncle = await this.web3Service.sipc.eth.getUncle(
            blockNumber,
            i,
          );
          uncle.extraData === '0x' && (uncle.extraData = '0x0');
          uncle.extraData.length > 5000 && (uncle.extraData = '0x0');
          const uncleReward = getUncleReward(uncle.number, blockNumber, reward);

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
          await this.sipcUncleService.findOrCreate(
            R.mergeRight(uncleObj, {
              blockNumber,
              uncleIndex: i,
              reward: uncleReward,
            }),
          );
        }
      }
    } catch (e) {
      console.log('get sipcBlock error:', blockNumber, e);
      blockNumber--;
    }
    await this.listenBlock(blockNumber + 1);
  }

  async syncBlocks() {
    const number = await this.web3Service.sipc.eth.getBlockNumber();
    const res = await this.sipcTransactionService.findOne({
      attributes: ['blockNumber'],
      limit: 1,
      raw: true,
      order: [['blockNumber', 'desc']],
    });
    const blockNumber = res ? res.blockNumber : 4866412;
    //this.listenBlock(Math.max(number, 10000000));
    this.listenBlockTransactions(number);
  }

  async listenBlockTransactions(blockNumber: number) {
    try {
      const currentHeight = await this.web3Service.sipc.eth.getBlockNumber();
      if (blockNumber % 10 === 0) {
        console.log('Get SIPC transaction', blockNumber);
      }
      // 确认12个块
      if (blockNumber > currentHeight) {
        setTimeout(async () => {
          await this.listenBlockTransactions(blockNumber - 12);
        }, 1000);
        return false;
      }
      const result = await this.web3Service.sipc.eth.getBlock(
        blockNumber,
        true,
      );

      const timestamp = result.timestamp;
      const queue = [];
      for (let i = 0; i < result.transactions.length; i++) {
        const transaction = result.transactions[i];
        const { input, hash, to } = transaction;
        if (to) {
          const code = await this.web3Service.sipc.eth.getCode(to);
          transaction.contract = code === '0x' ? '0x' : to;
        }
        (input === '0x' || input.length > 50000) && (transaction.input = '0x0');
        transaction.timestamp = timestamp;
        const transactionReceipt = await this.web3Service.getTransactionReceipt(
          hash.toString(),
          false,
        );
        const { gasUsed, logs, status } = transactionReceipt;
        transaction.gasUsed = gasUsed;
        transaction.status = status;
        // 如果是交易时间；to,value 赋值为tranfer函数的参数
        if (
          logs[0] &&
          logs[0].topics[0] === this.config.get('web3')['transferEvent']
        ) {
          const parameter = '0x' + input.slice(10);
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
          transaction.value = result.value;
          transaction.to = result.to;
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
          'type',
          'timestamp',
          'gasUsed',
          'status',
          'contract',
        ])(transaction);
        queue.push(
          this.sipcTransactionService.findOrCreate(
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
}
