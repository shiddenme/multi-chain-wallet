import { Injectable, Logger } from '@nestjs/common';

import developmentConfig from './development.config';
import productionConfig from './production.config';

@Injectable()
export class ConfigService {
  constructor() {
    this.logger.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);
  }
  private readonly logger = new Logger(ConfigService.name);
  private readonly config =
    process.env.NODE_ENV === 'production'
      ? productionConfig
      : developmentConfig;
  get(prop: string) {
    return this.config[prop];
  }
}
