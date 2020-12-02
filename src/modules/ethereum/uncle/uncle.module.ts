import { Module } from '@nestjs/common';
import { EthUncleService } from './uncle.service';
import { EthUncleProviders } from './uncle.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    EthUncleService,
    ...EthUncleProviders,
  ],
  exports:[EthUncleService]
})
export class EthUncleModule {}