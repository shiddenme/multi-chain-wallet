import { Module } from '@nestjs/common';
import { SipcUncleService } from './uncle.service';
import { SipcUncleProviders } from './uncle.providers';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    SipcUncleService,
    ...SipcUncleProviders,
  ],
  exports:[SipcUncleService]
})
export class SipcUncleModule {}