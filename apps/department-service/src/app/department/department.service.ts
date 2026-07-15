// apps/department-service/src/app/department/department.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './department.entity';
import {
  LoggerService,
  EmployeeCreatedEvent,
  EmployeeDeletedEvent,
  EmployeeUpdatedEvent,
} from '@my-nest-workspace/iop-common-utilities';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
    private readonly logger: LoggerService,
  ) {}

  findAll(traceId?: string): Promise<Department[]> {
    this.logger.info('Fetching all departments', {}, traceId);
    return this.repo.find();
  }

  async findById(id: number, traceId?: string): Promise<Department> {
    this.logger.debug('Looking up department', { id }, traceId);
    const dept = await this.repo.findOne({ where: { id } });
    if (!dept) {
      this.logger.warn('Department not found', { id }, traceId);
      throw new NotFoundException(`Department ${id} not found`);
    }
    return dept;
  }

  async create(name: string, description: string, traceId?: string): Promise<Department> {
    this.logger.info('Creating department', { name }, traceId);
    const dept = this.repo.create({ name, description });
    const saved = await this.repo.save(dept);
    this.logger.info('Department created', { id: saved.id, name }, traceId);
    return saved;
  }

  async update(id: number, name?: string, description?: string, traceId?: string): Promise<Department> {
    await this.findById(id, traceId);
    await this.repo.update(id, {
      ...(name && { name }),
      ...(description && { description }),
    });
    this.logger.info('Department updated', { id }, traceId);
    return this.findById(id, traceId);
  }

  async delete(id: number, traceId?: string): Promise<void> {
    await this.findById(id, traceId);
    await this.repo.delete(id);
    this.logger.info('Department deleted', { id }, traceId);
  }

  async onEmployeeCreated(event: EmployeeCreatedEvent): Promise<void> {
    this.logger.info(
      'Employee created — incrementing dept count',
      { deptId: event.deptId },
      event.traceId,
    );
    await this.repo.increment({ id: event.deptId }, 'employeeCount', 1);
  }

  async onEmployeeDeleted(event: EmployeeDeletedEvent): Promise<void> {
    this.logger.info(
      'Employee deleted — decrementing dept count',
      { deptId: event.deptId },
      event.traceId,
    );
    await this.repo.decrement({ id: event.deptId }, 'employeeCount', 1);
  }

  async onEmployeeUpdated(event: EmployeeUpdatedEvent): Promise<void> {
    if (event.oldDeptId === event.newDeptId) return;
    this.logger.info(
      'Employee moved departments',
      { from: event.oldDeptId, to: event.newDeptId },
      event.traceId,
    );
    await Promise.all([
      this.repo.decrement({ id: event.oldDeptId }, 'employeeCount', 1),
      this.repo.increment({ id: event.newDeptId }, 'employeeCount', 1),
    ]);
  }
}