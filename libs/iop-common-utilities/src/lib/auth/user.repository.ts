// libs/iop-common-utilities/src/lib/auth/user.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './auth.enum';

//What is the Repository pattern, really
// Before this file existed, auth.service.ts directly manipulated
// a plain array: usersStore.find(), usersStore.push().
//
// The Repository pattern says: NOTHING outside this file should
// know HOW user data is stored. AuthService should only ever say
// "give me the user with this email" — it should never know or
// care whether that means searching an array, querying Postgres,
// or calling an external API.
//
// This file is the ONLY place in your entire codebase that is
// allowed to know about TypeORM, SQL, or the `users` table
// structure. That's Dependency Inversion in practice: AuthService
// depends on this abstraction (a repository with simple methods),
// not on the concrete database technology underneath it.

@Injectable()
export class UserRepository {
  // @InjectRepository(User) gives you TypeORM's built-in Repository
  // class, pre-configured to work with the User entity specifically.
  // This Repository<User> object already knows the table name,
  // column names, and types — all defined back in user.entity.ts.
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  // findByEmail
  // Replaces: usersStore.find(u => u.email === email)
  //
  // TypeORM translates this into:
  //   SELECT * FROM users WHERE email = $1 LIMIT 1
  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  // findByUsername
  // Used during registration to check for duplicate usernames
  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findOne({ where: { username } });
  }

  // findById
  // Replaces: usersStore.find(u => u.id === id)
  // Called by jwt.strategy.ts on every authenticated request
  //
  // Note: id is now `number` to match user.entity.ts's
  // @PrimaryGeneratedColumn() type
  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  // findAll
  // Used by the admin-only GET /users endpoint
  //
  // TypeORM translates this into: SELECT * FROM users
  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  // create
  // Replaces: usersStore.push(newUser)
  //
  // TypeORM translates this into:
  //   INSERT INTO users (username, email, password_hash, role)
  //   VALUES ($1, $2, $3, $4) RETURNING *
  //
  // Notice this method takes already-hashed data — hashing the
  // password is AuthService's job (business logic), not this
  // repository's job (pure data access). This separation matters:
  // if you ever wrote a test for this repository, you wouldn't
  // need to worry about bcrypt at all.
  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }): Promise<User> {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }
}
