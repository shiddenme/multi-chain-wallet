import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '../../core';

import { EthTransactionService, EthTokenService } from '../../modules';

import { sleep } from '../utils';
import * as R from 'ramda';

const Web3 = require('web3');

import { erc20AbI } from '../abi/erc20';
import { crossAbI } from '../abi/cross';
import * as Tx from 'ethereumjs-tx';
class parseDto {
  internalType?: string;
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
      const myContract = this.getContract('erc20', f);
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

  // 编码erc20交易函数
  async getTransfer(transactionObject) {
    try {
      const { to, value } = transactionObject;
      const myContract = this.getContract('erc20', true);
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

  getContract(type: string, f: boolean) {
    const abi = type === 'cross' ? crossAbI : erc20AbI;
    const server = f ? this.web3 : this.sipc;
    return new server.eth.Contract(abi);
  }
  getRpcServer(crossChainId: number) {
    const chain = crossChainId === 3 ? 'ehereum' : 'simplechain';
    console.log('chain =', chain);
    return new Web3(
      new Web3.providers.HttpProvider(
        this.config.get('cross')[chain]['rpcServer'],
      ),
    );
  }

  async makeCrossTxn(query) {
    // simplechain 的chainId为3 ethereum的为1
    const { crossChainId = 3, destValue, from, to = '', input = '' } = query;
    const myContract = this.getContract('cross', true);
    const data = myContract.methods
      .makerStart(destValue, crossChainId, [from, to], Buffer.from(input))
      .encodeABI();
    const chain = crossChainId == 3 ? 'ehereum' : 'simplechain';
    const contractAddress =
      crossChainId == 3
        ? '0xB7F31CA6211cD8E4F72d85d95B70aFfE6421dE46'
        : '0x1616A39BB53a9D2F5d7930E64a4F67beF0dc40B3';
    return {
      crossTxn: data,
      server: this.config.get('cross')[chain]['rpcServer'],
      contractAddress,
    };
  }

  async takeCrossTxn(query) {
    const { to, input = '', crossChainId } = query;
    const ctx = {
      txId:
        '0x72381efa608e5d075f24b9c8b78e5e38dc6ed7b3c9a4cb1155be352708665499',
      txHash:
        '0xbd8944b8b90daa1bad33276f057a33886d305da6e9d9e7e2b1c0ed68601cd5b3',
      blockHash:
        '0x0ecfad2fe2fe9c0446c81b2a07993e440d704d27c77ccbfd12cc0e2fb1c942e2',
      value: '0x0',
      charge: '0xde0b6b3a7640000',
      from: '0xf58dcccd64c19e5f0349e51a3d02af5932c0609b',
      to: '0xf58dcccd64c19e5f0349e51a3d02af5932c0609b',
      origin: '0x3',
      purpose: '0x1',
      payload: '0x',
      time: '0x5ff55850',
      v: ['0x26', '0x25'],
      r: [
        '0x1d9631e7218812589b7d77478169a46b1feb7ff4e4134096d5e58e344944632b',
        '0xaf7fb37785a854143d1f84a4a0e2750c3d06003079a30488748ccb0baacc22aa',
      ],
      s: [
        '0x1b3aa53b4050ff743db0bd706a3fbf06178f3249de172820256f623e71cfae38',
        '0x193226e8b649af1ce04ddff9e3a6ff02504c9a06cedf563fed0dc9a0137054f7',
      ],
    };
    const myContract = this.getContract('cross', true);
    const chain = crossChainId == 3 ? 'ehereum' : 'simplechain';
    const contractAddress =
      crossChainId == 3
        ? '0xB7F31CA6211cD8E4F72d85d95B70aFfE6421dE46'
        : '0x1616A39BB53a9D2F5d7930E64a4F67beF0dc40B3';
    const data = myContract.methods
      .taker(ctx, to, Buffer.from(input))
      .encodeABI();
    return {
      crossTxn: data,
      server: this.config.get('cross')[chain]['rpcServer'],
      contractAddress,
    };
  }
}
