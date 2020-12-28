import { Injectable, HttpService, HttpException } from '@nestjs/common';
import { ConfigService } from '../../core';

@Injectable()
export class BitcoinService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async syncBlocks(node: string) {}

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
      throw new HttpException('节点错误', 500);
    }
    return res.data.result;
  }

  async listenBlockTransactions(blockNumber: number) {
    const currentHeight = await this.sendRequest('getblockcount', []);
    if (blockNumber > currentHeight) {
      setTimeout(async () => {
        await this.listenBlockTransactions(blockNumber - 6);
      }, 1000);
      return false;
    }
    const blockHash = await this.sendRequest('getblockhash', [blockNumber]);
    const block = await this.sendRequest('getblock', [blockHash]);
    console.log('block', block);
  }
}
