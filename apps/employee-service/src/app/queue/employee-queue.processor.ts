// apps/employee-service/src/app/queue/employee-queue.processor.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@my-nest-workspace/iop-common-utilities';
import {
  EMPLOYEE_QUEUE,
  EmpJobName,
  OnboardingJobData,
} from './employee-queue.constants';

@Processor(EMPLOYEE_QUEUE)
@Injectable()
export class EmployeeQueueProcessor extends WorkerHost {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case EmpJobName.ONBOARDING:
        return this.handleOnboarding(job as Job<OnboardingJobData>);
      default:
        this.logger.warn('Unknown job type', { jobName: job.name });
    }
  }

  private async handleOnboarding(job: Job<OnboardingJobData>): Promise<void> {
    const { employeeId, email, firstName, deptId, traceId } = job.data;

    // INFO — job started
    this.logger.info(
      `Processing onboarding for ${firstName}`,
      { jobId: job.id, employeeId, deptId, attempt: job.attemptsMade + 1 },
      traceId,
    );

    // Simulate onboarding steps
    await new Promise((r) => setTimeout(r, 200));

    // INFO — job completed
    this.logger.info(
      `Onboarding complete for ${email}`,
      { jobId: job.id, employeeId },
      traceId,
    );
  }
}
