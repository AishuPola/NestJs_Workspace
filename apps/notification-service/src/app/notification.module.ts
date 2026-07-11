// apps/notification-service/src/app/notification.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  IopCommonUtilitiesModule,
  LoggerModule,
} from '@my-nest-workspace/iop-common-utilities';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/notification-service/.env', '.env'],
    }),
    LoggerModule.register({ serviceName: 'notification-service' }),
    IopCommonUtilitiesModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
