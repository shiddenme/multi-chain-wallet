import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { ConfigService } from '../../core';

const blockchainAddressApi = require('../../core/api/blockchainAddressApi.js');
const blockchairAddressApi = require('../../core/api/blockchairAddressApi.js');
const blockcypherAddressApi = require('../../core/api/blockcypherAddressApi.js');
@Injectable()
export class BitcoinService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendRequest(method: string, params: any[]) {
    const res = await this.httpService
      .post(
        this.config.get('bitcoin')['server'],
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
}
