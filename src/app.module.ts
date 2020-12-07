import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { SharedModule } from './shared';
import {
  EthBlockModule,
  EthTokenModule,
  EthAssetModule,
  EthTransactionModule,
  SipcWalletTokenModule,
} from './modules';

@Module({
  imports: [
    CoreModule,
    SharedModule,
    EthBlockModule,
    EthTokenModule,
    EthAssetModule,
    EthTransactionModule,
    SipcWalletTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
