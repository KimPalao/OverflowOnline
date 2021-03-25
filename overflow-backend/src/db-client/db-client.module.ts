import { Module } from '@nestjs/common';
import { DbClientService } from './db-client.service';

/**
 * The nest module for the Redis Client
 */
@Module({
  providers: [DbClientService],
  exports: [DbClientService],
})
export class DbClientModule {}
