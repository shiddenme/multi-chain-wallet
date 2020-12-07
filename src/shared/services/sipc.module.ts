import { Module, Global } from '@nestjs/common';
import { SipcService } from './sipc.service';
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
  ],
  providers: [SipcService],
  exports: [SipcService],
})
export class SipcModule {
  constructor(sipc: SipcService) {
    sipc.setProvider();
  }
}
