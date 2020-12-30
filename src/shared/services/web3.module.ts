import { Module, Global } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { ConfigModule } from '../../core';
import {
  EthBlockModule,
  EthTransactionModule,
  EthTokenModule,
} from '../../modules';

@Global()
@Module({
  imports: [EthBlockModule, EthTransactionModule, EthTokenModule, ConfigModule],
  providers: [Web3Service],
  exports: [Web3Service],
})
export class Web3Module {
  constructor(web3: Web3Service) {
    console.log('============sss=========');
    setTimeout(() => {
      // web3.setProvider();
      // web3.syncBlocks();
    }, 2000);
  }
}
