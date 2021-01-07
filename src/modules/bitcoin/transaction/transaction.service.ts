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
    const offset = (parseInt(pageIndex) - 1) * parseInt(pageSize);
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
    const { txids, txCount } = addressDetailsResult.addressDetails;
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

    return {
      txs,
      count: txCount,
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

  async checkAddress(address: string) {
    const validateaddressResult = await this.btcService.sendRequest(
      'validateaddress',
      [address],
    );
    if (!validateaddressResult.isvalid) {
      throw new HttpException('isvalid address', 400);
    }
  }
  async createRawTransaction(body) {
    const { wallet, to, value, locktime, transactionFee } = body;
    const from_address = asAddress(wallet);
    const to_address = asAddress(to);
    await this.checkAddress(from_address);
    await this.checkAddress(to_address);
    // 生成inputs和outputs
    const inputs = [];
    const outputs = {
      [to_address]: value * Math.pow(10, -8),
    };
    // 选择获取utxo的地址
    const url =
      global.activeBlockchain === 'test'
        ? 'https://testnet.blockchain.info/unspent?active='
        : 'https://blockchain.info/unspent?active=';
    const unspent_outputs = await this.httpService
      .get(`${url}${wallet}`)
      .toPromise();
    const utxos: any = R.prop('unspent_outputs')(unspent_outputs.data);
    let sumInput: number = 0;
    let sumOutput: number = value + transactionFee;
    while (sumInput < sumOutput) {
      const utxo = utxos.pop();
      if (!utxo) {
        throw new HttpException('余额不足', 400);
      }
      const { tx_hash_big_endian: txid, value, tx_output_n: vout } = utxo;

      sumInput += value;
      inputs.push({
        txid,
        vout,
      });
    }
    for (let i = 0; i < inputs.length; i++) {
      const { txid, vout } = inputs[i];
      const voutDetail = await this.btcService.sendRequest('gettxout', [
        txid,
        vout,
      ]);
      inputs[i].scriptPubKey = voutDetail.scriptPubKey.hex;
    }
    // 找零
    const amountToKeep = sumInput - sumOutput;
    if (amountToKeep !== 0) {
      outputs[`${wallet}`] = amountToKeep * Math.pow(10, -8);
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
      inputs,
    };
  }

  async findAsset(query) {
    const { wallet } = query;
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
      1,
      10,
    );
    const { balanceSat } = addressDetailsResult.addressDetails;
    const btc2usd = await this.redis.get('btc2usd');
    const usd2cny = await this.redis.get('usd2cny');
    const tokens = [];
    const json: any = {};
    json.introduce =
      '比特币(BTC)是一种点对点的去中心化的数值货币,是人类历史上第一个真正的数字货币';
    json.projectName = 'BTC';
    json.officialWebsite = 'https://btc.com';
    json.contractAddress = '';
    json.tripartiteRating = '';
    json.publishTime = '2009-01-19 10:54:25';
    json.totalIssuance = 21000000;
    tokens.push({
      symbol: 'BTC',
      name: 'bitcoin',
      server:
        global.activeBlockchain === 'test'
          ? 'http://127.0.0.1:18332'
          : 'http://192.168.4.148:8332',
      icon: 'http://192.168.4.147:3000/images/btc.jpg',
      price: (parseFloat(btc2usd) * parseFloat(usd2cny)).toFixed(2),
      balance: balanceSat * Math.pow(10, -8),
      details: json,
    });
    return {
      tokens,
    };
  }
}
