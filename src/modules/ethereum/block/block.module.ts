import { Module } from '@nestjs/common';
import { EthBlockService } from './block.service';
import { EthBlockProviders } from './block.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    EthBlockService,
    ...EthBlockProviders,
  ],
  exports:[EthBlockService]
})
export class EthBlockModule {}