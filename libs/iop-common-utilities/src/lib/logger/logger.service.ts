// libs/iop-common-utilities/src/lib/logger/logger.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { LogLevel } from './logger.enum';

// ─── Log Level Guide ─────────────────────────────────────────
// ERROR  → something broke, needs immediate fix
//          Example: database connection failed, JWT signing failed
// WARN   → unexpected but app survived
//          Example: duplicate email attempt, config using defaults
// INFO   → normal expected events worth recording
//          Example: user registered, employee created, dept synced
// DEBUG  → internal detail, too noisy for production
//          Example: SQL query params, RabbitMQ envelope contents

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private log(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.logger.log(level, message, {
      ...meta,
      ...(traceId ? { traceId } : {}),
    });
  }

  // ERROR — system is broken
  // Use when: DB down, unhandled exception, critical failure
  error(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.ERROR, message, meta, traceId);
  }

  // WARN — something unexpected, app still running
  // Use when: retry attempt, deprecated endpoint called, fallback used
  warn(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.WARN, message, meta, traceId);
  }

  // INFO — normal business events
  // Use when: entity created, event published, service started
  info(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.INFO, message, meta, traceId);
  }

  // DEBUG — internal state, development only
  // Use when: SQL params, message body, intermediate values
  debug(
    message: string,
    meta: Record<string, unknown> = {},
    traceId?: string,
  ): void {
    this.log(LogLevel.DEBUG, message, meta, traceId);
  }
}
