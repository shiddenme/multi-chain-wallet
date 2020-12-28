import { Module } from '@nestjs/common';
import { EthTransactionService } from './transaction.service';
import { EthTransactionProviders } from './transaction.providers';
import { EthTransactionController } from './transaction.controller';
import { DatabaseModule } from '../../database/database.module';
import { EthBlockModule } from '../../ethereum/block/block.module';
import { EthTokenModule } from '../../ethereum/token/token.module';
import { ConfigModule } from '../../../core';

@Module({
  controllers: [EthTransactionController],
  imports: [DatabaseModule, EthBlockModule, EthTokenModule, ConfigModule],
  providers: [EthTransactionService, ...EthTransactionProviders],
  exports: [EthTransactionService],
})
export class EthTransactionModule {}
