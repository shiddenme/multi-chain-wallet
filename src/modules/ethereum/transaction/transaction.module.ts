import { Module } from '@nestjs/common';
import { EthTransactionService } from './transaction.service';
import { EthTransactionProviders } from './transaction.providers';
import { EthTransactionController } from './transaction.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  controllers: [EthTransactionController],
  imports: [DatabaseModule],
  providers: [EthTransactionService, ...EthTransactionProviders],
  exports: [EthTransactionService],
})
export class EthTransactionModule {}
