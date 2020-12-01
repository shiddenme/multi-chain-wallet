import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { SharedModule } from './shared'
import { BlockModule } from './modules'


@Module({
  imports: [
    CoreModule,
    SharedModule,
    BlockModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
