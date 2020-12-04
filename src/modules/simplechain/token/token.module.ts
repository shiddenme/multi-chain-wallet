import { Module } from '@nestjs/common';
import { SipcTokenService } from './token.service';
import { SipcTokenController } from './token.controller';
import { SipcTokenProviders } from './token.providers';
import { DatabaseModule } from '../../database/database.module';
import { SipcTransactionModule } from '../transaction/transaction.module'

@Module({
  imports: [DatabaseModule,SipcTransactionModule],
  controllers:[SipcTokenController],
  providers: [
    SipcTokenService,
    ...SipcTokenProviders,
  ],
  exports:[SipcTokenService]
})
export class SipcTokenModule {}