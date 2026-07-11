// apps/api/src/app/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import {
  IopCommonUtilitiesModule,
  LoggerModule,
} from '@my-nest-workspace/iop-common-utilities';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UsersController } from './users/users.controller';
import { ConfigController } from './config/config.controller';
import { NotificationQueueModule } from './queue/notification-queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    LoggerModule.register({ serviceName: 'api' }),
    IopCommonUtilitiesModule,
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    NotificationQueueModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UsersController,
    ConfigController,
  ],
  providers: [AppService],
})
export class AppModule {}
