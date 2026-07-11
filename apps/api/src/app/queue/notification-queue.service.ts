// apps/api/src/app/queue/notification-queue.service.ts

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { LoggerService } from '@my-nest-workspace/iop-common-utilities';
import {
  NOTIFICATION_QUEUE,
  JobName,
  WelcomeJobData,
  LoginAlertJobData,
} from './notification-queue.constants';

// ─── What is this file? ─────────────────────────────────────────
// The service that ADDS jobs to the queue.
// AuthService calls methods here — it has no knowledge of
// BullMQ or Redis underneath. Same Dependency Inversion as
// UserRepository in Week 3.
//
// Jobs are added with:
//   delay       — process after N milliseconds (Cloud Tasks equivalent)
//   attempts    — retry up to N times on failure
//   backoff     — exponential delay between retries
// These three settings are what makes BullMQ a real Cloud Tasks
// alternative — delayed execution + automatic retry is the core
// Cloud Tasks value proposition.

@Injectable()
export class NotificationQueueService {
  constructor(
    @InjectQueue(NOTIFICATION_QUEUE) private readonly queue: Queue,
    private readonly loggerService: LoggerService,
  ) {}

  // ─── addWelcomeJob() ──────────────────────────────────────────
  // Adds a welcome notification job delayed by 5 seconds.
  // This demonstrates the Cloud Tasks pattern:
  //   request returns immediately → job processes in background
  // delay: 5000 = job won't start until 5 seconds after adding
  async addWelcomeJob(data: WelcomeJobData): Promise<void> {
    const job = await this.queue.add(JobName.SEND_WELCOME, data, {
      delay: 5000,
      // ↑ 5 second delay — request returns, job processes later
      // In production: delay could be minutes/hours

      attempts: 3,
      // ↑ If the job fails, retry up to 3 times total

      backoff: {
        type: 'exponential',
        delay: 2000,
        // ↑ Retry delays: 2s, 4s, 8s — exponential backoff
        // prevents hammering a failing downstream service
      },

      removeOnComplete: {
        age: 86400, // keep completed jobs for 24 hours in dashboard
        count: 100, // keep last 100 completed jobs
      },

      removeOnFail: {
        age: 604800, // keep failed jobs for 7 days for debugging
      },
    });

    this.loggerService.info(
      `Welcome job queued (delay 5s)`,
      { jobId: job.id, userId: data.userId },
      data.traceId,
    );
  }

  // ─── addLoginAlertJob() ───────────────────────────────────────
  async addLoginAlertJob(data: LoginAlertJobData): Promise<void> {
    const job = await this.queue.add(JobName.SEND_LOGIN_ALERT, data, {
      delay: 0, // immediate — login alerts should be fast
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

  // ─── getQueueStats() ──────────────────────────────────────────
  // Used by the health check endpoint to show queue status
  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);
    return { waiting, active, completed, failed };
  }
}
