import {
  Module,
  NestModule,
  RequestMethod,
  MiddlewareConsumer,
} from '@nestjs/common';

import { CoreModule } from './core';
import { SipcModule } from './shared';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { transactionMiddleware } from './core';
import { EthTransactionModule } from './modules/ethereum/transaction/transaction.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }),
    CoreModule,
    SipcModule,
    EthTransactionModule,
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer
  //     .apply(transactionMiddleware)
  //     .forRoutes({ path: 'eth/transaction', method: RequestMethod.GET });
  // }
}
