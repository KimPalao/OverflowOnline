import { Module } from '@nestjs/common';
import { RedisClientService } from './redis-client.service';

/**
 * The nest module for the Redis Client
 */
@Module({
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
