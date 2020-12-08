import { Module } from '@nestjs/common';

import { CoreModule } from './core';
import { SharedModule } from './shared';

@Module({
  imports: [CoreModule, SharedModule],
})
export class AppModule {}
