// libs/iop-common-utilities/src/lib/logger/logger.service.ts

import { Injectable, Inject, Scope } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LogLevel } from './logger.enum';

// What is this file?
// The single logger you inject anywhere in the app.
// Wraps Winston so no other file ever imports Winston directly —
// same Dependency Inversion principle as UserRepository wrapping
// TypeORM in Week 3.
//
// Every log call automatically includes:
//   - level     (error / warn / info / debug)
//   - message   (what you pass in)
//   - timestamp (ISO 8601, set by Winston)
//   - service   (which microservice generated this log)
//   - traceId   (links this line to all other lines for the
//                same request, across both microservices)
//
// Usage anywhere in the app:
//   this.loggerService.info('User registered', { userId: 1 }, traceId);
//   → {"level":"info","message":"User registered","userId":1,"traceId":"abc","service":"api"}

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
    // ↑ WINSTON_MODULE_PROVIDER is a token from nest-winston
    // that gives us the raw Winston logger instance configured
    // in logger.module.ts
  ) {}

  // Core log method
  // All four public methods below delegate to this one.
  // Keeping all Winston calls in one place means if you ever
  // switch from Winston to a different logger, you change
  // exactly one method, not every file in the codebase.
  private log(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.logger.log(level, message, {
      ...meta,
      // traceId only included if one was provided —
      // some logs (like startup) happen before any
      // request exists and genuinely have no traceId
      ...(traceId ? { traceId } : {}),
    });
  }

  // ─── error() ─────────────────────────────────────────────────
  // Use when something broke and needs attention.
  // Always logged — production and development.
  // Pass the actual Error object in meta for stack traces.
  error(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.ERROR, message, meta, traceId);
  }

  // ─── warn() ──────────────────────────────────────────────────
  // Use when something unexpected happened but wasn't fatal.
  warn(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.WARN, message, meta, traceId);
  }

  // ─── info() ──────────────────────────────────────────────────
  // Use for normal, expected events you want to record.
  // This is your primary log level for request/response events.
  info(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.INFO, message, meta, traceId);
  }

  // ─── debug() ─────────────────────────────────────────────────
  // Use for detailed internal state useful during development.
  // Suppressed automatically in production by the log level
  // set in logger.module.ts based on NODE_ENV.
  debug(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.DEBUG, message, meta, traceId);
  }
}
