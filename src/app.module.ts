import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core';
import { SharedModule } from './shared';

@Module({
  imports: [CoreModule, SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
