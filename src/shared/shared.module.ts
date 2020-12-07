import { Module } from '@nestjs/common';
import { Web3Module, SipcModule } from './services';

@Module({
  imports: [SipcModule],
  exports: [SipcModule],
})
export class SharedModule {}
