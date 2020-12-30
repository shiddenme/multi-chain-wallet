import { Module, Logger } from '@nestjs/common';
import { ConfigService } from './config.service';

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
  constructor() {
    const logger = new Logger(ConfigModule.name);
    logger.debug(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
  }
}
