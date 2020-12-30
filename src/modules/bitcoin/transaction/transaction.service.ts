import { Injectable, Inject, forwardRef, HttpException } from '@nestjs/common';
import { asAddress } from '../../../shared/utils/tools';
import { BitcoinService } from '../bitcoin.service';
@Injectable()
export class BtcTransactionService {
  constructor(private readonly btcService: BitcoinService) {}
  async getTransactionByAddress(query) {
    const { wallet, pageIndex = 1, pageSize = 10 } = query;
    const offset = parseInt(pageIndex);
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
      validateaddressResult.scriptPubKey,
      'asc',
      offset,
      limit,
    );
    return addressDetailsResult;
  }
}
