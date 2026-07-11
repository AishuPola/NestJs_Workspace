// libs/iop-common-utilities/src/lib/config/secrets-config.classes.ts

import { IsString, MinLength, IsNumber } from 'class-validator';

//What is this file?
// Holds ONLY sensitive values — things that would cause a
// security breach if leaked.
//
// Keeping secrets separate from AppConfig means:
//   1. You can log AppConfig safely for debugging
//   2. You NEVER accidentally log SecretsConfig
//   3. In a code review, it's immediately obvious
//      which values are sensitive
//
// Rule: if it's a password, key, token, or credential → it goes here

export class SecretsConfig {
  // JWT_SECRET — signs and verifies every JWT token in the system
  // MinLength(32) enforces a minimum security level
  // A secret shorter than 32 chars can be brute-forced
  @IsString({ message: 'JWT_SECRET must be a string' })
  @MinLength(32, {
    message:
      "JWT_SECRET must be at least 32 characters — run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
  })
  jwtSecret: string;

  // DB_PASSWORD — placeholder for Week 3 (Snowflake)
  @IsString()
  dbHost: string;

  @IsNumber()
  dbPort: number;

  @IsString()
  dbName: string;

  @IsString()
  dbUser: string;

  @IsString()
  dbPassword: string;
}
