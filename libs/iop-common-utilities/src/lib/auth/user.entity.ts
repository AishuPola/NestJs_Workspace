// libs/iop-common-utilities/src/lib/auth/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from './auth.enum';

// What is this file?
// An "entity" in TypeORM is a class that represents a database
// table. Each property becomes a column. TypeORM reads these
// decorators to know exactly how to build SQL queries against
// the real `users` table you created earlier.
//
// This REPLACES the plain `User` interface you had in
// auth.service.ts during Week 1. That interface was just a
// TypeScript shape with no connection to a real database.
// This class IS the connection — TypeORM uses it to generate
// SELECT, INSERT, UPDATE statements automatically.

@Entity('users')
// ↑ tells TypeORM this class maps to the table named 'users'
// (the exact table you created with CREATE TABLE users (...) earlier)
export class User {
  @PrimaryGeneratedColumn()
  // ↑ maps to: id SERIAL PRIMARY KEY
  // TypeORM auto-generates this — you never set it manually
  id: number;
  // Note: number, not string like your old in-memory User.id
  // Postgres SERIAL produces integers, not the `usr_${Date.now()}`
  // string IDs you were generating before

  @Column({ unique: true, length: 30 })
  // ↑ maps to: username VARCHAR(30) UNIQUE NOT NULL
  username: string;

  @Column({ unique: true, length: 255 })
  // ↑ maps to: email VARCHAR(255) UNIQUE NOT NULL
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  // ↑ maps to: password_hash VARCHAR(255) NOT NULL
  //
  // IMPORTANT: { name: 'password_hash' } tells TypeORM the actual
  // database column is snake_case, while the TypeScript property
  // stays camelCase (passwordHash). This is a common convention —
  // SQL traditionally uses snake_case, TypeScript uses camelCase.
  // Without this mapping, TypeORM would look for a column literally
  // named "passwordHash" and fail to find it.
  passwordHash: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.USER,
  })
  // ↑ maps to: role VARCHAR(20) NOT NULL DEFAULT 'USER'
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  // ↑ maps to: created_at TIMESTAMP NOT NULL DEFAULT NOW()
  //
  // @CreateDateColumn is a special decorator — TypeORM automatically
  // sets this to the current timestamp when a row is first inserted.
  // You never set this manually, same as before with `new Date()`
  // in your in-memory version, but now Postgres itself guarantees it.
  createdAt: Date;
}
