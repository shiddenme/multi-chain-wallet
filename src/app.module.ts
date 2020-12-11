import { Module } from '@nestjs/common';

import { CoreModule } from './core';
import { SipcModule } from './shared';

@Module({
  imports: [CoreModule, SipcModule],
})
export class AppModule {}
