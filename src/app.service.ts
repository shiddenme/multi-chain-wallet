import { Injectable } from '@nestjs/common';
import { SipcService } from './shared/services';

@Injectable()
export class AppService {

  constructor(
    private readonly sipcService: SipcService
  ) {}
  async getHello(): Promise<string> {
    this.sipcService.syncBlocks();
    return 'Hello World!';
  }
}
