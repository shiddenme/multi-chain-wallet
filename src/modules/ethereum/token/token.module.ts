import { Module } from '@nestjs/common';
import { EthTokenService } from './token.service';
import { EthTokenController } from './token.controller';
import { EthTokenProviders } from './token.providers';
import { DatabaseModule } from '../../database/database.module';
import { EthTransactionModule } from '../transaction/transaction.module'

@Module({
  imports: [DatabaseModule,EthTransactionModule],
  controllers:[EthTokenController],
  providers: [
    EthTokenService,
    ...EthTokenProviders,
  ],
  exports:[EthTokenService]
})
export class EthTokenModule {}