import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { SharedModule } from './shared'
import { EthBlockModule, EthTokenModule, EthWalletTokenModule, EthTransactionModule } from './modules'


@Module({
  imports: [
    CoreModule,
    SharedModule,
    EthBlockModule,
    EthTokenModule,
    EthWalletTokenModule,
    EthTransactionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
