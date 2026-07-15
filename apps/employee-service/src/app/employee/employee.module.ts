// apps/employee-service/src/app/employee/employee.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { Employee } from './employee.entity';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from './employee.repository';
import { QUEUE_SERVICE_TOKEN } from '@my-nest-workspace/iop-common-utilities';
import { EmployeeQueueService } from '../queue/employee-queue.service';
import { EmployeeQueueProcessor } from '../queue/employee-queue.processor';
import { EMPLOYEE_QUEUE } from '../queue/employee-queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    BullModule.registerQueue({ name: EMPLOYEE_QUEUE }),
    BullBoardModule.forFeature({
      name: EMPLOYEE_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    EmployeeRepository,
    EmployeeQueueService,
    EmployeeQueueProcessor,
    { provide: QUEUE_SERVICE_TOKEN, useExisting: EmployeeQueueService },
  ],
})
export class EmployeeModule {}
