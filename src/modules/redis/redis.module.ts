import { Module } from '@nestjs/common';
import { redisProviders } from './redis.provider';
import { ConfigModule } from '../../core';
@Module({
  imports: [ConfigModule],
  providers: [...redisProviders],
  exports: [...redisProviders],
})
export class RedisModule {}
