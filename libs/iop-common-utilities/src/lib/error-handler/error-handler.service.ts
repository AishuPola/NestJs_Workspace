// libs/iop-common-utilities/src/lib/error-handler/error-handler.service.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { IopErrorDto, ErrorCode } from './iop-error.dto';
import { LoggerService } from '../logger/logger.service';

// ─── What is this file? ─────────────────────────────────────────
// A global exception filter — the last line of defence before
// an error reaches the client.
//
// @Catch() with no arguments means: catch EVERY unhandled
// exception from anywhere in the app — your own exceptions,
// TypeORM errors, unexpected crashes, everything.
//
// Without this filter:
//   - TypeORM errors leak raw SQL and stack traces to clients
//   - NestJS default errors have inconsistent shapes
//   - traceId is never included in error responses
//
// With this filter:
//   - Every error becomes an IopErrorDto — consistent shape
//   - traceId is always in the response
//   - The error is logged before the response is sent
//   - Raw database errors never reach the client
//
// Both microservices register this as a global filter in
// their main.ts — same filter, same error shape, both services.

@Catch()
@Injectable()
export class ErrorHandlerService implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const traceId = request.traceId || 'no-trace-id';
    const path = request.url;

    // ── Map the exception to a statusCode + errorCode ──────
    let statusCode: number;
    let message: string;
    let errorCode: string;

    if (exception instanceof HttpException) {
      // NestJS built-in exceptions — BadRequestException,
      // UnauthorizedException, ForbiddenException, etc.
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // NestJS ValidationPipe returns { message: string[] }
      // — join array into a single string if needed
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        message = Array.isArray(resp.message)
          ? (resp.message as string[]).join(', ')
          : (resp.message as string) || exception.message;
      } else {
        message = exception.message;
      }

      // Map HTTP status codes to our ErrorCode constants
      errorCode = this.mapStatusToErrorCode(statusCode, message);
    } else if (exception instanceof QueryFailedError) {
      // TypeORM database errors — duplicate key, constraint
      // violation, connection error, etc.
      // NEVER leak raw SQL error messages to the client
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'A database error occurred';
      errorCode = ErrorCode.DATABASE_ERROR;

      // Log the actual SQL error for debugging — but only
      // in logs, never in the response
      this.loggerService.error(
        'Database query failed',
        { sqlMessage: (exception as any).message },
        traceId,
      );
    } else {
      // Completely unexpected error — catch-all
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      errorCode = ErrorCode.INTERNAL_ERROR;
    }

    // ── Build the consistent error response ────────────────
    const errorDto = new IopErrorDto(
      statusCode,
      message,
      errorCode,
      path,
      traceId,
    );

    // ── Log the error with full context ───────────────────
    // Use .error() for 5xx, .warn() for 4xx
    // (4xx are client mistakes, not server problems)
    if (statusCode >= 500) {
      this.loggerService.error(
        `Error ${statusCode}: ${message}`,
        {
          errorCode,
          path,
          stack:
            exception instanceof Error ? exception.stack : 'No stack trace',
        },
        traceId,
      );
    } else {
      this.loggerService.warn(
        `Client error ${statusCode}: ${message}`,
        { errorCode, path },
        traceId,
      );
    }

    // ── Send the response ─────────────────────────────────
    response.status(statusCode).json(errorDto);
  }

  // ─── mapStatusToErrorCode ─────────────────────────────────
  // Converts an HTTP status code to a machine-readable
  // ErrorCode string. Checks the message for specific keywords
  // to pick the most precise code (e.g. TOKEN_EXPIRED vs
  // UNAUTHORIZED for two different 401 scenarios).
  private mapStatusToErrorCode(statusCode: number, message: string): string {
    const msg = message.toLowerCase();

    switch (statusCode) {
      case 400:
        return ErrorCode.VALIDATION_ERROR;

      case 401:
        if (msg.includes('expired')) return ErrorCode.TOKEN_EXPIRED;
        if (msg.includes('invalid token')) return ErrorCode.INVALID_TOKEN;
        return ErrorCode.UNAUTHORIZED;

      case 403:
        if (msg.includes('role')) return ErrorCode.INSUFFICIENT_ROLE;
        return ErrorCode.FORBIDDEN;

      case 404:
        if (msg.includes('user')) return ErrorCode.USER_NOT_FOUND;
        return ErrorCode.NOT_FOUND;

      case 409:
        if (msg.includes('email')) return ErrorCode.EMAIL_ALREADY_EXISTS;
        return ErrorCode.CONFLICT;

      default:
        return statusCode >= 500
          ? ErrorCode.INTERNAL_ERROR
          : ErrorCode.BAD_REQUEST;
    }
  }
}
