// apps/api/src/app/queue/notification-queue.processor.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@my-nest-workspace/iop-common-utilities';
import {
  NOTIFICATION_QUEUE,
  JobName,
  WelcomeJobData,
  LoginAlertJobData,
} from './notification-queue.constants';

// ─── What is this file? ─────────────────────────────────────────
// The worker that actually processes jobs from the queue.
// @Processor(NOTIFICATION_QUEUE) tells BullMQ: "this class
// handles jobs from that specific queue."
//
// BullMQ calls process() automatically when a job is ready.
// If process() throws, BullMQ retries the job automatically
// with exponential backoff — configured in notification-queue.service.ts
// when the job is added.
//
// This replaces the direct HTTP call AND the RabbitMQ subscriber
// for background work — BullMQ handles the async processing.

@Processor(NOTIFICATION_QUEUE)
@Injectable()
export class NotificationQueueProcessor extends WorkerHost {
  constructor(private readonly loggerService: LoggerService) {
    super();
  }

  // ─── process() ─────────────────────────────────────────────────
  // BullMQ calls this for every job in the queue.
  // Dispatches to the right handler based on job name.
  async process(job: Job): Promise<void> {
    switch (job.name) {
      case JobName.SEND_WELCOME:
        return this.handleWelcome(job as Job<WelcomeJobData>);
      case JobName.SEND_LOGIN_ALERT:
        return this.handleLoginAlert(job as Job<LoginAlertJobData>);
      default:
        this.loggerService.warn(`Unknown job type: ${job.name}`, {
          jobId: job.id,
        });
    }
  }

  // ─── handleWelcome() ──────────────────────────────────────────
  // Simulates sending a welcome notification.
  // In production: call SendGrid, Firebase, Twilio, etc.
  private async handleWelcome(job: Job<WelcomeJobData>): Promise<void> {
    const { userId, email, username, traceId } = job.data;

    this.loggerService.info(
      `Processing welcome notification job`,
      { jobId: job.id, userId, email, attemptsMade: job.attemptsMade },
      traceId,
    );

    // Simulate async work — replace with real notification logic
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.loggerService.info(
      `Welcome notification sent to ${email}`,
      { jobId: job.id, userId },
      traceId,
    );
  }

  // ─── handleLoginAlert() ───────────────────────────────────────
  private async handleLoginAlert(job: Job<LoginAlertJobData>): Promise<void> {
    const { userId, email, traceId } = job.data;

    this.loggerService.info(
      `Processing login alert job`,
      { jobId: job.id, userId, email },
      traceId,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    this.loggerService.info(
      `Login alert sent to ${email}`,
      { jobId: job.id, userId },
      traceId,
    );
  }
}
