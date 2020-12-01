import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockProviders } from './block.providers';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    BlockService,
    ...BlockProviders,
  ],
  exports:[BlockService]
})
export class BlockModule {}