import { Module } from '@nestjs/common';
import { EthTransactionService } from './transaction.service';
import { EthTransactionProviders } from './transaction.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    EthTransactionService,
    ...EthTransactionProviders,
  ],
  exports:[EthTransactionService]
})
export class EthTransactionModule {}