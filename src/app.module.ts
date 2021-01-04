import { Module } from '@nestjs/common';

import { CoreModule } from './core';
import { SipcModule } from './shared';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { BtcTransactionModule } from './modules/bitcoin/transaction/transaction.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'client'),
      exclude: ['/api*'],
    }),
    CoreModule,
    SipcModule,
    BtcTransactionModule,
  ],
})
export class AppModule {}
