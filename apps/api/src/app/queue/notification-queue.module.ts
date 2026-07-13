// apps/api/src/app/queue/notification-queue.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { NOTIFICATION_QUEUE } from './notification-queue.constants';
import { NotificationQueueProcessor } from './notification-queue.processor';
import { NotificationQueueService } from './notification-queue.service';
import { QUEUE_SERVICE_TOKEN } from '@my-nest-workspace/iop-common-utilities';

@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
    BullBoardModule.forFeature({
      name: NOTIFICATION_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [
    NotificationQueueProcessor,
    NotificationQueueService,
    // ← Provide the queue service under the shared token
    // so AuthService can inject it without knowing the concrete class
    {
      provide: QUEUE_SERVICE_TOKEN,
      useExisting: NotificationQueueService,
    },
  ],
  exports: [NotificationQueueService, QUEUE_SERVICE_TOKEN],
})
export class NotificationQueueModule {}
