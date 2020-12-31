import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { asAddress } from '../../../shared/utils/tools';
import { BitcoinService } from '../bitcoin.service';
import * as R from 'ramda';
import * as moment from 'moment';
@Injectable()
export class BtcTransactionService {
  constructor(private readonly btcService: BitcoinService) {}
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
    const { txids, txCount } = addressDetailsResult.addressDetails;
    const rawTxResult = await this.btcService.getRawTransactionsWithInputs(
      txids,
      address,
    );
    const { transactions, txInputsByTransaction } = rawTxResult;
    const txs = transactions.map((transaction) => {
      const { hash, time, txid } = transaction;
      const { vin, vout } = txInputsByTransaction[txid];
      const value =
        R.reduce(R.add, 0)(R.map(R.prop('value'))(vout)) -
        R.reduce(R.add, 0)(R.map(R.prop('value'))(vin));
      const mark = value < 0 ? '-' : '+';
      const date = moment(time * 1000)
        .utcOffset(480)
        .format('YYYY-MM-DD HH:mm:ss');
      return {
        hash,
        value: Math.abs(value).toString(),
        date,
        mark,
      };
    });
    return {
      txs,
      count: txCount,
    };
  }
}
