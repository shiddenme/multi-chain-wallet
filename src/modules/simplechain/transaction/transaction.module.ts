import { Module } from '@nestjs/common';
import { SipcTransactionService } from './transaction.service';
import { SipcTransactionProviders } from './transaction.providers';
import { SipcTransactionController } from './transaction.controller';
import { DatabaseModule } from '../../database/database.module';
import { SipcTokenModule } from '../token/token.module';
@Module({
  controllers: [SipcTransactionController],
  imports: [DatabaseModule, SipcTokenModule],
  providers: [SipcTransactionService, ...SipcTransactionProviders],
  exports: [SipcTransactionService],
})
export class SipcTransactionModule {}
