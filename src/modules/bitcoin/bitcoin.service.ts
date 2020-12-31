import { Injectable, HttpService, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '../../core';

const blockchainAddressApi = require('../../core/api/blockchainAddressApi.js');
const blockchairAddressApi = require('../../core/api/blockchairAddressApi.js');
const blockcypherAddressApi = require('../../core/api/blockcypherAddressApi.js');
type vinId = {
  txid: string;
  voutIndex: number;
};
import * as R from 'ramda';

@Injectable()
export class BitcoinService {
  private readonly logger = new Logger(BitcoinService.name);
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendRequest(method: string, params: any[]) {
    const res = await this.httpService
      .post(
        this.config.get('bitcoin')[global.activeBlockchain],
        {
          jsonrpc: '1.0',
          id: 'call',
          method,
          params,
        },
        {
          headers: this.config.get('bitcoin')['header'],
        },
      )
      .toPromise();
    if (!res.data || res.data.error) {
      this.logger.error(res.data.error);
      throw new HttpException(res.data.error, 500);
    }
    return res.data.result;
  }

  async getAddressDetails(address, scriptPubkey, sort, offset, limit) {
    const addressApi = this.config.get('bitcoin')['addressApi'];
    const promises = [];
    if (addressApi == 'blockchain.com') {
      promises.push(
        blockchainAddressApi.getAddressDetails(
          address,
          scriptPubkey,
          sort,
          limit,
          offset,
        ),
      );
    } else if (addressApi == 'blockchair.com') {
      promises.push(
        blockchairAddressApi.getAddressDetails(
          address,
          scriptPubkey,
          sort,
          limit,
          offset,
        ),
      );
    } else if (addressApi == 'blockcypher.com') {
      promises.push(
        blockcypherAddressApi.getAddressDetails(
          address,
          scriptPubkey,
          sort,
          limit,
          offset,
        ),
      );
    } else {
      throw new HttpException('server error', 500);
    }
    const results = await Promise.all(promises);
    return results[0];
  }

  async getRawTransactionsWithInputs(
    txids: string[],
    address: string,
    maxInputs = -1,
  ) {
    const transactions = await Promise.all(
      R.map(async (txid) => {
        return await this.sendRequest('getrawtransaction', [txid, 1]);
      })(txids),
    );
    const maxInputsTracked = maxInputs < 0 ? 1000000 : maxInputs;
    const vinIds: vinId[] = [];
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];

      if (transaction && transaction.vin) {
        for (
          let j = 0;
          j < Math.min(maxInputsTracked, transaction.vin.length);
          j++
        ) {
          if (transaction.vin[j].txid) {
            vinIds.push({
              txid: transaction.vin[j].txid,
              voutIndex: transaction.vin[j].vout,
            });
          }
        }
      }
    }
    // 取出全部vin 遍历拿到全部vout
    const summarizedTxOutputs = {};
    await Promise.all(
      R.map(async (vinId: vinId) => {
        const summarizedTxOutput = await this.getSummarizedTransactionOutput(
          vinId.txid,
          vinId.voutIndex,
        );
        // 只保存当前地址的utxo
        if (summarizedTxOutput.address === address) {
          summarizedTxOutputs[
            `${summarizedTxOutput.txid}:${summarizedTxOutput.n}`
          ] = summarizedTxOutput;
        }
      })(vinIds),
    );

    const txInputsByTransaction = {};

    transactions.forEach(function (tx) {
      txInputsByTransaction[tx.txid] = {};
      txInputsByTransaction[tx.txid].vin = [];
      txInputsByTransaction[tx.txid].vout = [];
      if (tx && tx.vin) {
        for (let i = 0; i < Math.min(maxInputsTracked, tx.vin.length); i++) {
          var summarizedTxOutput =
            summarizedTxOutputs[`${tx.vin[i].txid}:${tx.vin[i].vout}`];
          if (summarizedTxOutput) {
            txInputsByTransaction[tx.txid].vin.push(summarizedTxOutput);
          }
        }
      }
      if (tx && tx.vout) {
        for (let j = 0; j < tx.vout.length; j++) {
          if (
            tx.vout[j].scriptPubKey &&
            tx.vout[j].scriptPubKey.addresses &&
            tx.vout[j].scriptPubKey.addresses[0] === address
          ) {
            txInputsByTransaction[tx.txid].vout.push(tx.vout[j]);
          }
        }
      }
    });
    return {
      transactions: transactions,
      txInputsByTransaction: txInputsByTransaction,
    };
  }

  async getSummarizedTransactionOutput(txid, voutIndex) {
    try {
      const rawTx = await this.sendRequest('getrawtransaction', [txid, 1]);

      const vout = rawTx.vout[voutIndex];
      if (vout.scriptPubKey) {
        if (vout.scriptPubKey.asm) {
          delete vout.scriptPubKey.asm;
        }

        if (vout.scriptPubKey.hex) {
          delete vout.scriptPubKey.hex;
        }
        if (vout.scriptPubKey.addresses && vout.scriptPubKey.addresses.length) {
          vout.address = vout.scriptPubKey.addresses[0];
          delete vout.scriptPubKey.addresses;
        }
      }

      vout.txid = txid;
      vout.utxoTime = rawTx.time;

      if (rawTx.vin.length == 1 && rawTx.vin[0].coinbase) {
        vout.coinbaseSpend = true;
      }

      return vout;
    } catch (e) {
      this.logger.error(e);
    }
  }
}
