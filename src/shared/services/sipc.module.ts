import { Module, Global } from '@nestjs/common';
import { SipcService } from './sipc.service';
import { ConfigModule } from '../../core';
import { SipcTransactionModule, SipcTokenModule } from '../../modules';
import { Web3Module } from './web3.module';

@Global()
@Module({
  imports: [SipcTransactionModule, SipcTokenModule, Web3Module, ConfigModule],
  providers: [SipcService],
  exports: [SipcService],
})
export class SipcModule {
  constructor(sipc: SipcService) {
    setTimeout(() => {
      // sipc.setProvider('sipc');
      // sipc.syncBlocks('sipc');
      // sipc.setProvider('slc');
      // sipc.syncBlocks('slc');
    }, 2000);
  }
}
