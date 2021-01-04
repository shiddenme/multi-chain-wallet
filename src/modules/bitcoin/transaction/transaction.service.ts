import { Injectable, Inject, HttpService, HttpException } from '@nestjs/common';
import { asAddress } from '../../../shared/utils/tools';
import { BitcoinService } from '../bitcoin.service';
import * as R from 'ramda';
import * as moment from 'moment';

type vin = {
  txid: string;
  vout: number;
  scriptSig?: any;
  txinwitness?: any[];
  sequence?: number;
};
@Injectable()
export class BtcTransactionService {
  constructor(
    private readonly btcService: BitcoinService,
    private readonly httpService: HttpService,
    @Inject('REDIS')
    private readonly redis,
  ) {}
  async getTransactionByAddress(query) {
    const { wallet, pageIndex = 1, pageSize = 10 } = query;
    const offset = parseInt(pageIndex) - 1;
    const limit = parseInt(pageSize);
    const address = asAddress(wallet);
    const validateaddressResult = await this.btcService.sendRequest(
      'validateaddress',
      [address],
    );
    if (!validateaddressResult.isvalid) {
      throw new HttpException('isvalid address', 400);
    }

    const addressDetailsResult = await this.btcService.getAddressDetails(
      address,
      'validateaddressResult.scriptPubKey',
      'asc',
      offset,
      limit,
    );
    const { txids, txCount, balanceSat } = addressDetailsResult.addressDetails;
    const rawTxResult = await this.btcService.getRawTransactionsWithInputs(
      txids,
      address,
    );
    const { transactions, txInputsByTransaction } = rawTxResult;
    const txs = transactions.map((transaction) => {
      const { time, txid } = transaction;
      const { vin, vout } = txInputsByTransaction[txid];
      const value =
        R.reduce(R.add, 0)(R.map(R.prop('value'))(vout)) -
        R.reduce(R.add, 0)(R.map(R.prop('value'))(vin));
      const mark = value < 0 ? '-' : '+';
      const date = moment(time * 1000)
        .utcOffset(480)
        .format('YYYY-MM-DD HH:mm:ss');
      return {
        txid,
        value: Math.abs(value).toString(),
        date,
        mark,
      };
    });
    // todo：存redis
    const btc2usd = await this.redis.get('btc2usd');
    const usd2cny = await this.redis.get('usd2cny');

    return {
      txs,
      balance: balanceSat * Math.pow(10, -8),
      count: txCount,
      server:
        global.activeBlockchain === 'test'
          ? 'http://127.0.0.1:18332'
          : 'http://192.168.4.148:8332',
      icon: 'http://192.168.4.147:3000/images/btc.jpg',
      price: (parseFloat(btc2usd) * parseFloat(usd2cny)).toFixed(2),
    };
  }

  async getTransactionDetail(txid: string) {
    const rawTx = await this.btcService.sendRequest('getrawtransaction', [
      txid,
      1,
    ]);
    let inputs = [];
    const { vin: vins, vout: outputs, time, blockhash } = rawTx;
    if (vins) {
      inputs = await Promise.all(
        R.map(async (ele: vin) => {
          return await this.btcService.getSummarizedTransactionOutput(
            ele.txid,
            ele.vout,
          );
        })(vins),
      );
    }
    const txnFee =
      R.reduce(R.add, 0)(R.map(R.prop('value'))(inputs)) -
      R.reduce(R.add, 0)(R.map(R.prop('value'))(outputs));
    const date = moment(time * 1000)
      .utcOffset(480)
      .format('YYYY-MM-DD HH:mm:ss');
    const getAddress = (input) => {
      if (!input.scriptPubKey || !input.scriptPubKey.addresses) return '';
      return input.scriptPubKey.addresses[0];
    };
    const block = await this.btcService.sendRequest('getblock', [blockhash]);
    return R.mergeRight(R.omit(['vin', 'vout', 'hex'])(rawTx), {
      txnFee,
      date,
      blockNumber: block.height,
      inputs: R.map(R.prop('address'))(inputs),
      outputs: R.map(getAddress)(outputs),
    });
  }

  async createRawTransaction(body) {
    const { inputs, outputs, locktime } = body;
    const keys = Object.keys(outputs);
    console.log(keys);
    if (keys.length !== 1 || !asAddress(keys[0])) {
      throw new HttpException('isvalid address', 400);
    }
    const params = [];
    params.push(inputs);
    params.push(outputs);
    if (locktime) {
      params.push(locktime);
    }
    const rawTransaction = await this.btcService.sendRequest(
      'createrawtransaction',
      params,
    );
    return {
      rawTransaction,
    };
  }
}
