import * as Redis from 'ioredis';
import { ConfigService } from '../../core';
export const redisProviders = [
  {
    provide: 'REDIS',
    useFactory: async () => {
      const config = new ConfigService();
      const redis = new Redis(config.get('redis'));
      return redis;
    },
  },
];
