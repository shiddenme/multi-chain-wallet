import { Module } from '@nestjs/common';
import { SipcTokenService } from './token.service';
import { SipcTokenController } from './token.controller';
import { SipcTokenProviders } from './token.providers';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule } from '../../../core';
@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [SipcTokenController],
  providers: [SipcTokenService, ...SipcTokenProviders],
  exports: [SipcTokenService],
})
export class SipcTokenModule {}
