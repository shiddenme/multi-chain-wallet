import { Module } from '@nestjs/common';

import { CoreModule } from './core';
import { SipcModule } from './shared';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }),
    CoreModule,
    SipcModule,
  ],
})
export class AppModule {}
