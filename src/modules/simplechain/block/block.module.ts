import { Module } from '@nestjs/common';
import { SipcBlockService } from './block.service';
import { SipcBlockProviders } from './block.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    SipcBlockService,
    ...SipcBlockProviders,
  ],
  exports:[SipcBlockService]
})
export class SipcBlockModule {}