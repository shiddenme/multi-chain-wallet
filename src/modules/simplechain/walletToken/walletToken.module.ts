import { Module } from '@nestjs/common';
import { SipcWalletTokenService } from './walletToken.service';
import { SipcWalletTokenController } from './walletToken.controller';
import { SipcWalletTokenProviders } from './walletToken.providers';
import { DatabaseModule } from '../../database/database.module';
import { SipcTokenModule } from '../token/token.module'

@Module({
  imports: [DatabaseModule, SipcTokenModule],
  controllers:[SipcWalletTokenController],
  providers: [
    SipcWalletTokenService,
    ...SipcWalletTokenProviders,
  ],
  exports:[SipcWalletTokenService]
})
export class SipcWalletTokenModule {}