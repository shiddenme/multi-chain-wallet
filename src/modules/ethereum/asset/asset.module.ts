import { Module } from '@nestjs/common';
import { EthAssetService } from './asset.service';
import { EthAssertController } from './asset.controller';
import { EthWalletTokenProviders } from './asset.providers';
import { DatabaseModule } from '../../database/database.module';
import { EthTokenModule } from '../token/token.module';

@Module({
  imports: [DatabaseModule, EthTokenModule],
  controllers: [EthAssertController],
  providers: [EthAssetService, ...EthWalletTokenProviders],
  exports: [EthAssetService],
})
export class EthAssetModule {}
