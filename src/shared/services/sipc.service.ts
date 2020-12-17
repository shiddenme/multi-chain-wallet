import { Injectable } from '@nestjs/common';

import { SipcTransactionService } from '../../modules';

import { sleep } from '../utils';
import * as R from 'ramda';
import { ConfigService } from '../../core';
const Web3 = require('web3');

import { Web3Service } from './web3.service';

@Injectable()
export class SipcService {
  constructor(
    private readonly web3Service: Web3Service,
    private readonly sipcTransactionService: SipcTransactionService,
    private readonly config: ConfigService,
  ) {}

  async setProvider(node: String) {
    const server =
      node === 'sipc' ? this.web3Service.sipc : this.web3Service.slc;
    const url =
      node === 'sipc'
        ? this.config.get('web3')['sipcServer']
        : this.config.get('web3')['slcServer'];
    try {
      await server.eth.net.isListening();
    } catch (e) {
      console.log(e);
      console.log('[ - ] Lost connection to the node, reconnecting', url);
      await server.setProvider(new Web3.providers.HttpProvider(url));
      await sleep(this.config.get('web3')['reconnect']);
      await this.setProvider(node);
    }
  }

  async syncBlocks(node: string) {
    const server =
      node === 'sipc' ? this.web3Service.sipc : this.web3Service.slc;
    const number = await server.eth.getBlockNumber();
    const res = await this.sipcTransactionService.findOne(
      {
        attributes: ['blockNumber'],
        limit: 1,
        raw: true,
        order: [['blockNumber', 'desc']],
      },
      node,
    );
    const blockNumber = res ? res.blockNumber : number;
    //this.listenBlock(Math.max(number, 10000000));
    this.listenBlockTransactions(blockNumber, node);
  }

  async listenBlockTransactions(blockNumber: number, node: string) {
    const server =
      node === 'sipc' ? this.web3Service.sipc : this.web3Service.slc;
    try {
      const currentHeight = await server.eth.getBlockNumber();
      if (blockNumber % 10 === 0) {
        console.log(`Get ${node} transaction`, blockNumber);
      }
      // 确认12个块
      if (blockNumber > currentHeight) {
        setTimeout(async () => {
          await this.listenBlockTransactions(blockNumber - 12, node);
        }, 1000);
        return false;
      }
      const result = await server.eth.getBlock(blockNumber, true);

      const timestamp = result.timestamp;
      const queue = [];
      for (let i = 0; i < result.transactions.length; i++) {
        const transaction = result.transactions[i];
        const { input, hash, to } = transaction;
        if (to) {
          const code = await server.eth.getCode(to);
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
            node,
          ),
        );
      }
      await Promise.all(queue);
    } catch (e) {
      console.log('get ethTransactions error:', blockNumber, e);
      blockNumber--;
    }
    await this.listenBlockTransactions(blockNumber + 1, node);
  }
}
