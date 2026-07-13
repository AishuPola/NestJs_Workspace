// apps/api/src/app/queue/notification-queue.service.ts

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '@my-nest-workspace/iop-common-utilities';
import { IQueueService } from '@my-nest-workspace/iop-common-utilities';
import {
  NOTIFICATION_QUEUE,
  JobName,
  WelcomeJobData,
  LoginAlertJobData,
} from './notification-queue.constants';

@Injectable()
export class NotificationQueueService implements IQueueService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue,
    private readonly loggerService: LoggerService,
  ) {}

  async addWelcomeJob(data: WelcomeJobData): Promise<void> {
    const job = await this.queue.add(JobName.SEND_WELCOME, data, {
      delay: 5000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { age: 86400, count: 100 },
      removeOnFail: { age: 604800 },
    });

    console.log(
      '[BullMQ] ✓ Welcome job added, id:',
      job.id,
      'delay: 5s, userId:',
      data.userId,
    );

    this.loggerService.info(
      `Welcome job queued (delay 5s)`,
      { jobId: job.id, userId: data.userId },
      data.traceId,
    );
  }

  async addLoginAlertJob(data: LoginAlertJobData): Promise<void> {
    const job = await this.queue.add(JobName.SEND_LOGIN_ALERT, data, {
      delay: 0,
      attempts: 2,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 50 },
      removeOnFail: { age: 86400 },
    });

    this.loggerService.info(
      `Login alert job queued`,
      { jobId: job.id, userId: data.userId },
      data.traceId,
    );
  }

  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);
    return { waiting, active, completed, failed, delayed };
  }
}
