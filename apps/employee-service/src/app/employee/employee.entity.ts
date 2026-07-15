// // apps/employee-service/src/app/employee/employee.entity.ts

// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
// } from 'typeorm';

// @Entity('employees')
// export class Employee {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ name: 'first_name', length: 50 })
//   firstName: string;

//   @Column({ name: 'last_name', length: 50 })
//   lastName: string;

//   @Column({ unique: true, length: 255 })
//   email: string;

//   @Column({ name: 'dept_id' })
//   deptId: number;
//   // ↑ THE KEY FIELD — links employee to department
//   // employee-service stores this ID
//   // When employee is created → publishes event with deptId
//   // department-service consumes event → updates its employee_count

//   @Column({ length: 100 })
//   position: string;

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   salary: number;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: Date;
// }

// apps/employee-service/src/app/employee/employee.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', length: 50 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'dept_id' })
  deptId: number;

  @Column({ length: 100 })
  position: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
