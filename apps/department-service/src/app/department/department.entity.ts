// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
// } from 'typeorm';

// @Entity('departments')
// export class Department {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ unique: true, length: 100 })
//   name: string;

//   @Column({ length: 255, nullable: true })
//   description: string;

//   @Column({ name: 'employee_count', default: 0 })
//   employeeCount: number;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;
// }

// apps/department-service/src/app/department/department.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('departments')
// ↑ must match the exact table name in PostgreSQL
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'employee_count', default: 0 })
  employeeCount: number;
  // ↑ name: 'employee_count' maps camelCase to snake_case column

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
