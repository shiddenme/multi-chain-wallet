import { Module } from '@nestjs/common';
import { EthWalletTokenService } from './walletToken.service';
import { EthWalletTokenController } from './walletToken.controller';
import { EthWalletTokenProviders } from './walletToken.providers';
import { DatabaseModule } from '../../database/database.module';
import { EthTokenModule } from '../token/token.module'

@Module({
  imports: [DatabaseModule, EthTokenModule],
  controllers:[EthWalletTokenController],
  providers: [
    EthWalletTokenService,
    ...EthWalletTokenProviders,
  ],
  exports:[EthWalletTokenService]
})
export class EthWalletTokenModule {}