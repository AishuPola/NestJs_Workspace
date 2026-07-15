// apps/employee-service/src/app/employee/employee.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Employee } from './employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';
import { EmployeeRepository } from './employee.repository';
import {
  LoggerService,
  PubSubPublisherService,
  FeatureFlagService,
  QUEUE_SERVICE_TOKEN,
  IQueueService,
  EventName,
  EmployeeCreatedEvent,
  EmployeeUpdatedEvent,
  EmployeeDeletedEvent,
} from '@my-nest-workspace/iop-common-utilities';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly employeeRepo: EmployeeRepository,
    private readonly logger: LoggerService,
    private readonly pubSub: PubSubPublisherService,
    private readonly featureFlag: FeatureFlagService,
    @Optional()
    @Inject(QUEUE_SERVICE_TOKEN)
    private readonly queueService: IQueueService | null,
  ) {}

  // ─── GET ALL ───────────────────────────────────────────────
  async findAll(traceId?: string): Promise<Employee[]> {
    // INFO — normal retrieval
    this.logger.info('Fetching all employees', {}, traceId);
    const employees = await this.employeeRepo.findAll();
    // DEBUG — show count, too noisy if shown always
    this.logger.debug(
      'Employees fetched',
      { count: employees.length },
      traceId,
    );
    return employees;
  }

  // ─── GET BY ID ─────────────────────────────────────────────
  async findById(id: number, traceId?: string): Promise<Employee> {
    this.logger.debug('Looking up employee', { id }, traceId);
    const emp = await this.employeeRepo.findById(id);
    if (!emp) {
      // WARN — not found is client mistake, not server crash
      this.logger.warn('Employee not found', { id }, traceId);
      throw new NotFoundException(`Employee ${id} not found`);
    }
    return emp;
  }

  // ─── CREATE ────────────────────────────────────────────────
  async create(dto: CreateEmployeeDto, traceId?: string): Promise<Employee> {
    this.logger.info(
      'Creating employee',
      { email: dto.email, deptId: dto.deptId },
      traceId,
    );

    try {
      const emp = await this.employeeRepo.create(dto);

      // INFO — success
      this.logger.info(
        'Employee created successfully',
        { id: emp.id, deptId: emp.deptId },
        traceId,
      );

      // Publish RabbitMQ event — dept-service will update employee_count
      if (this.featureFlag.isEnabled('pubsub')) {
        const event: EmployeeCreatedEvent = {
          type: EventName.EMPLOYEE_CREATED,
          employeeId: emp.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          deptId: emp.deptId,
          position: emp.position,
          traceId: traceId || '',
          timestamp: new Date().toISOString(),
        };
        this.pubSub.publish(event).catch((err) => {
          // WARN — publish failed, app still works
          this.logger.warn(
            'Failed to publish employee.created',
            { error: err.message },
            traceId,
          );
        });
      }

      // Add BullMQ onboarding job — 10s delay
      if (this.featureFlag.isEnabled('bullmq') && this.queueService) {
        this.queueService
          .addWelcomeJob({
            userId: emp.id,
            email: emp.email,
            username: emp.firstName,
            traceId: traceId || '',
          })
          .catch((err) => {
            this.logger.warn(
              'Failed to queue onboarding job',
              { error: err.message },
              traceId,
            );
          });
      }

      return emp;
    } catch (error) {
      // ERROR — unexpected DB failure
      this.logger.error(
        'Failed to create employee',
        { error: (error as Error).message, email: dto.email },
        traceId,
      );
      throw error;
    }
  }

  // ─── UPDATE ────────────────────────────────────────────────
  async update(
    id: number,
    dto: UpdateEmployeeDto,
    traceId?: string,
  ): Promise<Employee> {
    this.logger.debug(
      'Updating employee',
      { id, fields: Object.keys(dto) },
      traceId,
    );

    const existing = await this.findById(id, traceId);
    const updated = await this.employeeRepo.update(id, dto);
    if (!updated)
      throw new NotFoundException(`Employee ${id} not found after update`);

    this.logger.info(
      'Employee updated',
      { id, deptId: updated.deptId },
      traceId,
    );

    // Publish event if dept changed
    if (this.featureFlag.isEnabled('pubsub')) {
      const event: EmployeeUpdatedEvent = {
        type: EventName.EMPLOYEE_UPDATED,
        employeeId: id,
        oldDeptId: existing.deptId,
        newDeptId: updated.deptId,
        traceId: traceId || '',
        timestamp: new Date().toISOString(),
      };
      this.pubSub.publish(event).catch(() => {});
    }

    return updated;
  }

  // ─── DELETE ────────────────────────────────────────────────
  async delete(id: number, traceId?: string): Promise<void> {
    const emp = await this.findById(id, traceId);

    await this.employeeRepo.delete(id);

    this.logger.info('Employee deleted', { id, deptId: emp.deptId }, traceId);

    if (this.featureFlag.isEnabled('pubsub')) {
      const event: EmployeeDeletedEvent = {
        type: EventName.EMPLOYEE_DELETED,
        employeeId: id,
        deptId: emp.deptId,
        traceId: traceId || '',
        timestamp: new Date().toISOString(),
      };
      this.pubSub.publish(event).catch(() => {});
    }
  }
}
