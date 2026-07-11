// apps/api/src/app/queue/notification-queue.module.ts

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Inject } from '@nestjs/common';
import { APP_CONFIG } from '@my-nest-workspace/iop-common-utilities';
import { IAppConfig } from '@my-nest-workspace/iop-common-utilities';
import { NOTIFICATION_QUEUE } from './notification-queue.constants';
import { NotificationQueueProcessor } from './notification-queue.processor';
import { NotificationQueueService } from './notification-queue.service';

// ─── What is this file? ─────────────────────────────────────────
// Wires BullMQ into NestJS for one specific queue.
// BullModule.registerQueue() is the equivalent of
// TypeOrmModule.forFeature() from Week 3 — it registers
// this queue for injection in this module's scope only.

@Module({
  imports: [
    // Register the queue — backed by Redis configured in app.module.ts
    BullModule.registerQueue({
      name: NOTIFICATION_QUEUE,
    }),

    // Bull Board — registers this queue with the visual dashboard
    // The dashboard itself is mounted in main.ts
    BullBoardModule.forFeature({
      name: NOTIFICATION_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [NotificationQueueProcessor, NotificationQueueService],
  exports: [NotificationQueueService],
})
export class NotificationQueueModule {}
