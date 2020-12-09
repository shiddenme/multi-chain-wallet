import { Module, Global } from '@nestjs/common';
import { SipcService } from './sipc.service';
import { ConfigModule } from '../../core';
import {
  SipcBlockModule,
  SipcTransactionModule,
  SipcUncleModule,
  SipcTokenModule,
} from '../../modules';
import { Web3Module } from './web3.module';

@Global()
@Module({
  imports: [
    SipcBlockModule,
    SipcTransactionModule,
    SipcUncleModule,
    SipcTokenModule,
    Web3Module,
    ConfigModule,
  ],
  providers: [SipcService],
  exports: [SipcService],
})
export class SipcModule {
  constructor(sipc: SipcService) {
    setTimeout(() => {
      sipc.setProvider();
      sipc.syncBlocks();
    }, 2000);
  }
}
