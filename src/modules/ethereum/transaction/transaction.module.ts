import { Module, HttpModule } from '@nestjs/common';
import { EthTransactionService } from './transaction.service';
import { EthTransactionProviders } from './transaction.providers';
import { EthTransactionController } from './transaction.controller';
import { DatabaseModule } from '../../database/database.module';
import { EthBlockModule } from '../block/block.module';
import { EthTokenModule } from '../token/token.module';

@Module({
  controllers: [EthTransactionController],
  imports: [DatabaseModule, EthBlockModule, EthTokenModule, HttpModule],
  providers: [EthTransactionService, ...EthTransactionProviders],
  exports: [EthTransactionService],
})
export class EthTransactionModule {}
