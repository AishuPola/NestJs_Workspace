// apps/employee-service/src/app/employee/employee.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto } from './employee.dto';

@Injectable()
export class EmployeeRepository {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  findAll(): Promise<Employee[]> {
    return this.repo.find();
  }

  findById(id: number): Promise<Employee | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByDeptId(deptId: number): Promise<Employee[]> {
    return this.repo.find({ where: { deptId } });
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const emp = this.repo.create(dto);
    return this.repo.save(emp);
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<Employee | null> {
    await this.repo.update(id, dto);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
