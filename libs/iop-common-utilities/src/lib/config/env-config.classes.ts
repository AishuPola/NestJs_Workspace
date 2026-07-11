// libs/iop-common-utilities/src/lib/config/env-config.classes.ts

import { IsEnum, IsNumber, IsString, Min, Max } from 'class-validator';

// ─── What is this file? ───────────────────────────────────────
// This class maps your raw .env string values into
// strongly-typed TypeScript properties.
//
// Without this:
//   configService.get('PORT') → returns string | undefined
//   You have to manually parse, cast, and check everywhere
//
// With this:
//   appConfig.port → returns number, guaranteed
//   appConfig.nodeEnv → returns 'development' | 'production' | 'test'
//   TypeScript autocomplete works everywhere

// NodeEnv enum
// Restricts NODE_ENV to only valid values
// If someone sets NODE_ENV=staging in .env, Joi validation
// will catch it at startup before the app serves a single request
export enum NodeEnv {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// AppConfig class
// Represents all NON-SECRET environment variables
// Rule: if a value is sensitive (password, secret key),
//       it goes in SecretsConfig — NOT here
export class AppConfig {
  // NODE_ENV — must be one of the NodeEnv enum values
  // @IsEnum catches typos like NODE_ENV=developement at startup
  @IsEnum(NodeEnv, {
    message: `NODE_ENV must be one of: ${Object.values(NodeEnv).join(', ')}`,
  })
  nodeEnv: NodeEnv;

  // PORT — must be a number between 1024 and 65535
  // .env files store everything as strings — the config provider
  // will parse this to a number before validation runs
  @IsNumber({}, { message: 'PORT must be a number' })
  @Min(1024, { message: 'PORT must be at least 1024' })
  @Max(65535, { message: 'PORT must be at most 65535' })
  port: number;

  // APP_NAME — just a string, used in health check and logs
  @IsString({ message: 'APP_NAME must be a string' })
  appName: string;

  // APP_VERSION — used in health check response
  // Helps in production: you know exactly which version is running
  @IsString({ message: 'APP_VERSION must be a string' })
  appVersion: string;

  // JWT_EXPIRES_IN — how long tokens are valid
  // Not a secret (it's not sensitive), but config
  // Examples: '1d', '7d', '15m', '1h'
  @IsString({ message: 'JWT_EXPIRES_IN must be a string like 1d or 15m' })
  jwtExpiresIn: string;
}
