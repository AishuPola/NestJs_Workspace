// libs/iop-common-utilities/src/lib/config/config.validation.ts

import * as Joi from 'joi';

//  What is this file?
// Joi is a schema validation library. Unlike class-validator
// (which validates AFTER values are parsed into a class),
// Joi validates the RAW environment variables the moment
// the app boots — before any module, controller, or service
// is even instantiated.
//
// This is the "Fail Fast at Startup" principle in its purest form:
//   - Missing JWT_SECRET → app crashes immediately with a clear message
//   - PORT is not a number → app crashes immediately
//   - NODE_ENV has a typo → app crashes immediately
//
// Without this: the app would start "successfully" with bad config,
// then fail mysteriously the first time someone tries to log in
// (because JWT_SECRET was undefined) — much harder to debug.

//  The validation schema
// This describes EVERY environment variable your app needs,
// what type it must be, whether it's required, and default values

export const configValidationSchema = Joi.object({
  // NODE_ENV
  // Must be exactly one of these three strings
  // .default('development') means if NODE_ENV is missing,
  // assume development rather than crashing — this one is safe
  // to default because forgetting it just means "local dev mode"
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // PORT
  // Joi automatically converts the string '3000' to number 3000
  // .min/.max prevent nonsense values like PORT=0 or PORT=999999
  PORT: Joi.number().min(1024).max(65535).default(3000),

  // JWT_SECRET
  // .required() — THIS IS THE KEY LINE
  // If JWT_SECRET is missing from .env, Joi throws an error
  // and the app NEVER starts — no fallback, no default
  // .min(32) enforces minimum security length
  JWT_SECRET: Joi.string().min(32).required().messages({
    'any.required':
      "JWT_SECRET is required — app cannot start without it. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    'string.min': 'JWT_SECRET must be at least 32 characters for security',
  }),

  // JWT_EXPIRES_IN
  // Pattern checks it looks like a valid duration string: 1d, 7d, 15m, 1h
  // Not required — falls back to '1d' if missing
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('1d')
    .messages({
      'string.pattern.base':
        'JWT_EXPIRES_IN must look like a duration: 15m, 1h, 1d, 7d',
    }),

  // APP_NAME / APP_VERSION
  // Not security-critical — safe to default
  APP_NAME: Joi.string().default('iop-api'),
  APP_VERSION: Joi.string().default('1.0.0'),

  //  Database (Week 3 placeholder)
  // .allow('') means empty string is OK for now
  // Week 3 will change these to .required() once Snowflake is wired up
  DB_HOST: Joi.string().required().messages({
    'any.required':
      'DB_HOST is required — PostgreSQL connection cannot be established without it',
  }),
  DB_PORT: Joi.number().min(1).max(65535).required(),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required().messages({
    'any.required':
      'DB_PASSWORD is required — app cannot connect to the database without it',
  }),

  RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
  // Not .required() because Week 1-4 demos still work without it
  // when ENABLE_PUBSUB=false

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  ENABLE_PUBSUB: Joi.boolean().default(false),
  ENABLE_BULLMQ: Joi.boolean().default(false),
});
