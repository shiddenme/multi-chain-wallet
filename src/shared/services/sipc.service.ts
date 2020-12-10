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
import { from } from 'rxjs';
@Injectable()
export class SipcService {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly sipcBlcokService: SipcBlockService,
    private readonly sipcUncleService: SipcUncleService,
    private readonly sipcTransactionService: SipcTransactionService,
    private readonly config: ConfigService,
  ) {}

  async getTransactionReceipt(hash: string) {
    return await this.web3Service.sipc.eth.getTransactionReceipt(hash);
  }

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
    console.log('start block:', number);
    this.listenBlock(number);
    this.listenBlockTransactions(4826601);
  }

  async listenBlockTransactions(blockNumber) {
    try {
      const currentHeight = await this.web3Service.sipc.eth.getBlockNumber();
      if (blockNumber > currentHeight) {
        setTimeout(async () => {
          await this.listenBlockTransactions(blockNumber);
        }, 1000);
        return false;
      }
      const result = await this.web3Service.sipc.eth.getBlock(
        blockNumber,
        true,
      );
      const timestamp = result.timestamp;
      if (R.isNil(result)) {
        return false;
      }
      const queue = [];

      for (let i = 0; i < result.transactions.length; i++) {
        const transaction = result.transactions[i];

        (transaction.input === '0x' || transaction.input.length > 50000) &&
          (transaction.input = '0x0');
        transaction.timestamp = timestamp;
        if (!transaction.to) {
          transaction.type = 'CALL';
        } else {
          const code = await this.web3Service.sipc.eth.getCode(transaction.to);
          if (code === '0x') {
            transaction.type = 'EOA';
          } else {
            transaction.type = 'CALL';
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
          'type',
          'timestamp',
        ])(transaction);
        queue.push(
          this.sipcTransactionService.findOrCreate(
            R.mergeRight(transactionObj, {
              from:
                transaction.from && transaction.from.toString().toLowerCase(),
              to: transaction.to && transaction.to.toString().toLowerCase(),
            }),
          ),
        );
      }
      await Promise.all(queue);
    } catch (e) {
      console.log('get sipcTransactions error:', blockNumber, e);
      blockNumber--;
    }
    await this.listenBlockTransactions(blockNumber + 1);
  }
}
