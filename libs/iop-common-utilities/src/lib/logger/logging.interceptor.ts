// libs/iop-common-utilities/src/lib/logger/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

// What is this file?
// An interceptor wraps every route handler automatically.
// This one logs every incoming request and outgoing response
// WITHOUT touching a single controller.
//
// Without this interceptor you'd have to write this manually
// in every controller method:
//   logger.info('POST /auth/register', {}, req.traceId)
//   logger.info('POST /auth/register 201 45ms', {}, req.traceId)
//
// With this interceptor, those two lines happen automatically
// for every single route in both microservices, just by
// registering it globally in main.ts.
//
// Flow for every request:
//   → request arrives
//   → interceptor logs: "→ POST /auth/register [traceId: abc]"
//   → controller runs
//   → interceptor logs: "← POST /auth/register 201 45ms [traceId: abc]"
//   → response sent

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const { method, url, traceId } = request;
    const startTime = Date.now();

    // Log the INCOMING request before the controller runs
    this.loggerService.info(`→ ${method} ${url}`, { type: 'request' }, traceId);

    // tap() runs a side-effect AFTER the handler completes
    // without modifying the response — perfect for logging
    return next.handle().pipe(
      tap({
        // Success path — controller returned a response
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.loggerService.info(
            `← ${method} ${url} ${statusCode} ${duration}ms`,
            { type: 'response', statusCode, duration },
            traceId,
          );
        },
        // Error path — controller threw an exception
        // The global exception filter handles the actual error
        // response shape; this interceptor just logs it
        error: (error: Error) => {
          const duration = Date.now() - startTime;

          this.loggerService.error(
            `← ${method} ${url} ERROR ${duration}ms`,
            {
              type: 'response',
              error: error.message,
              duration,
            },
            traceId,
          );
        },
      }),
    );
  }
}
