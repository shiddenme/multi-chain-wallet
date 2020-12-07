import { Module } from '@nestjs/common';
import { SipcAssetService } from './asset.service';
import { SipcAssetController } from './asset.controller';
import { SipcWalletTokenProviders } from './asset.providers';
import { DatabaseModule } from '../../database/database.module';
import { SipcTokenModule } from '../token/token.module';

@Module({
  imports: [DatabaseModule, SipcTokenModule],
  controllers: [SipcAssetController],
  providers: [SipcAssetService, ...SipcWalletTokenProviders],
  exports: [SipcAssetService],
})
export class SipcWalletTokenModule {}
