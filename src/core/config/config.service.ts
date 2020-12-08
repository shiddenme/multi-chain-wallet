import { Injectable } from '@nestjs/common';

import developmentConfig from './development.config';
@Injectable()
export class ConfigService {
  private readonly config = developmentConfig;
  get(prop: string) {
    return this.config[prop];
  }
}
