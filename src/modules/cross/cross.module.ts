import { Module, HttpModule } from '@nestjs/common';
import { EthCrossService } from './cross.service';
import { EthCrossController } from './cross.controller';
import { ConfigModule } from '../../core';

@Module({
  controllers: [EthCrossController],
  imports: [ConfigModule, HttpModule],
  providers: [EthCrossService],
  exports: [EthCrossService],
})
export class EthCrossModule {}
