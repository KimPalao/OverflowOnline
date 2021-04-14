import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { DbClientModule } from './db-client/db-client.module';
import { RedisClientModule } from './redis-client/redis-client.module';

/**
 * The default app module
 */
@Module({
  imports: [
    RedisClientModule,
    DbClientModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule {}
