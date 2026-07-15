// apps/employee-service/src/app/queue/employee-queue.service.ts

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  LoggerService,
  IQueueService,
} from '@my-nest-workspace/iop-common-utilities';
import {
  EMPLOYEE_QUEUE,
  EmpJobName,
  OnboardingJobData,
} from './employee-queue.constants';

@Injectable()
export class EmployeeQueueService implements IQueueService {
  constructor(
    @InjectQueue(EMPLOYEE_QUEUE) private readonly queue: Queue,
    private readonly logger: LoggerService,
  ) {}

  // IQueueService interface — called from EmployeeService after create
  async addWelcomeJob(data: {
    userId: number;
    email: string;
    username: string;
    traceId: string;
  }): Promise<void> {
    const job = await this.queue.add(
      EmpJobName.ONBOARDING,
      {
        employeeId: data.userId,
        email: data.email,
        firstName: data.username,
        traceId: data.traceId,
      } as OnboardingJobData,
      {
        delay: 10000, // 10s delay — onboarding starts after a brief pause
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 86400, count: 100 },
        removeOnFail: { age: 604800 },
      },
    );
    console.log(
      '[EmployeeQueue] ✓ Onboarding job added, id:',
      job.id,
      'delay: 10s',
    );
    this.logger.info(
      'Onboarding job queued',
      { jobId: job.id, employeeId: data.userId },
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
