// libs/iop-common-utilities/src/lib/logger/trace-id.middleware.ts

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// What is this file?
// Middleware runs BEFORE any guard, interceptor, or controller.
// This one does exactly one job: make sure every request has
// a traceId before anything else in the app sees it.
//
// Two cases:
//   1. Request comes from a client (browser, Postman, curl)
//      → no X-Trace-Id header exists yet
//      → we generate a new UUID and attach it
//
//   2. Request comes from another microservice (API service
//      calling notification-service)
//      → X-Trace-Id header already exists (forwarded by the caller)
//      → we READ it and keep it — this is what links logs
//        across both services under the same traceId
//
// After this middleware runs, req.traceId is guaranteed to exist
// everywhere downstream — guards, interceptors, controllers,
// services — no request ever reaches your business logic
// without a traceId attached.

// Extend Express's Request type so TypeScript knows
// req.traceId is a valid field
declare module 'express' {
  interface Request {
    traceId: string;
  }
}

export const TRACE_ID_HEADER = 'x-trace-id';
// ↑ The HTTP header name. Lowercase because HTTP/2 requires
// lowercase headers and it's a good habit to be consistent.
// Both microservices use this same constant — defined once here,
// imported everywhere else — no chance of one service using
// 'X-Trace-Id' and another using 'x-traceid'.

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Check if a traceId was forwarded by another service.
    // When the API service calls notification-service, it
    // includes the original traceId in this header.
    const existingTraceId = req.headers[TRACE_ID_HEADER] as string;

    // Use the forwarded traceId if it exists, generate a new
    // one if this is a fresh request from an external client.
    const traceId = existingTraceId || uuidv4();

    // Attach to the request object so every piece of code
    // downstream can access it via req.traceId
    req.traceId = traceId;

    // Also echo it back in the response header — this means
    // your Postman/curl output will show the traceId too,
    // making it easy to grep your logs for that specific request
    res.setHeader(TRACE_ID_HEADER, traceId);

    next();
  }
}
