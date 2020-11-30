import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {

  constructor(
    private readonly config: ConfigService,
  ) {}
  getHello(): string {
    
    console.log(this.config.get('web3'))
    return 'Hello World!';
  }
}
