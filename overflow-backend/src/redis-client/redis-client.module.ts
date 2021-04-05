import { Module } from '@nestjs/common';
import { DbClientModule } from '../db-client/db-client.module';
import { RedisClientService } from './redis-client.service';

/**
 * The nest module for the Redis Client
 */
@Module({
  imports: [
    DbClientModule,
  ],
  providers: [RedisClientService],
  exports: [RedisClientService],
})
export class RedisClientModule {}
