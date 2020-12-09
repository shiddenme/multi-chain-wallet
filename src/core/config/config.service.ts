import { Injectable } from '@nestjs/common';

import developmentConfig from './development.config';
import productionConfig from './production.config';

@Injectable()
export class ConfigService {
  private readonly config =
    process.env.NODE_ENV === 'production'
      ? productionConfig
      : developmentConfig;
  get(prop: string) {
    return this.config[prop];
  }
}
