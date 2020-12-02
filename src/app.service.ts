import { Injectable } from '@nestjs/common';
import { Web3Service } from './shared/services';

@Injectable()
export class AppService {

  constructor(
    private readonly web3Service: Web3Service
  ) {}
  async getHello(): Promise<string> {
    this.web3Service.syncBlocks();
    return 'Hello World!';
  }
}
