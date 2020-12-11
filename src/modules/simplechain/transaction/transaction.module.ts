import { Module, HttpModule } from '@nestjs/common';
import { SipcTransactionService } from './transaction.service';
import { SipcTransactionProviders } from './transaction.providers';
import { SipcTransactionController } from './transaction.controller';
import { DatabaseModule } from '../../database/database.module';
import { SipcBlockModule } from '../block/block.module';
import { SipcTokenModule } from '../token/token.module';
@Module({
  controllers: [SipcTransactionController],
  imports: [DatabaseModule, SipcBlockModule, SipcTokenModule, HttpModule],
  providers: [SipcTransactionService, ...SipcTransactionProviders],
  exports: [SipcTransactionService],
})
export class SipcTransactionModule {}
