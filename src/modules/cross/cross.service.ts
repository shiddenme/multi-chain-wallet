import { Injectable, HttpService, Inject, forwardRef } from '@nestjs/common';

import { ConfigService } from '../../core';
import { Web3Service } from '../../shared';
import * as R from 'ramda';

@Injectable()
export class EthCrossService {
  constructor(
    @Inject(forwardRef(() => Web3Service))
    private readonly web3Service: Web3Service,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {}

  async sendRequest(method: string, params: any[]) {
    try {
      const res = await this.httpService
        .post(
          this.config.get('cross')['ehereum']['crossServer'],
          {
            jsonrpc: '2.0',
            method,
            params,
            id: 67,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .toPromise();
      return res.data.result;
    } catch (e) {
      console.log('Error=', e);
    }
  }

  async findCrossTxn(query) {
    const { wallet, pageIndex = 1, pageSize = 10 } = query;
    const ownerCross = await this.sendRequest('cross_ctxOwnerByPage', [
      wallet,
      pageSize,
      pageIndex,
    ]);
    const takerCross = await this.sendRequest('cross_ctxTakerByPage', [
      wallet,
      pageSize,
      pageIndex,
    ]);

    const result: any[] = R.concat(
      R.flatten(Object.values(ownerCross.data)),
      R.flatten(Object.values(takerCross.data)),
    );
    const diff = (a: any, b: any) => {
      return a.time - b.time;
    };
    const crossTxn = R.slice(
      0,
      9,
      R.sort(
        diff,
        R.forEach((ele: any) => {
          ele.time = Number(ele.time);
          ele.value = Number(ele.value);
        })(result),
      ),
    );
    return { crossTxn };
  }

  async crossTxn(query) {
    const { type } = query;
    if (type === 'make') {
      return await this.web3Service.makeCrossTxn(query);
    } else {
      return await this.web3Service.takeCrossTxn(query);
    }
  }
}
