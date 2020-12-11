import { Module } from '@nestjs/common';

import { CoreModule } from './core';
import { Web3Module, SipcModule } from './shared';

@Module({
  imports: [CoreModule, Web3Module, SipcModule],
})
export class AppModule {}
