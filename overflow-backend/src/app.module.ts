import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { DbClientModule } from './db-client/db-client.module';
import { RedisClientModule } from './redis-client/redis-client.module';

/**
 * The default app module
 */
@Module({
  imports: [RedisClientModule, DbClientModule],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
