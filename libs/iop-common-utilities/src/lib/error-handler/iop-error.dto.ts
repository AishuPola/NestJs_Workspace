// libs/iop-common-utilities/src/lib/error-handler/iop-error.dto.ts

// ─── What is this file? ─────────────────────────────────────────
// Defines the SHAPE of every error response from both services.
//
// Without this, errors look different depending on where they
// originate:
//   NestJS default 404:  { statusCode: 404, message: 'Not Found' }
//   TypeORM error:       { code: 'ER_DUP_ENTRY', sqlMessage: '...' }
//   Your own exception:  { error: 'Something went wrong' }
//
// With IopErrorDto, every error — regardless of origin —
// returns the exact same shape. Your manager can write
// frontend code that handles errors reliably because the
// contract never changes.
//
// Also notice: traceId is included in every error response.
// This means when a user reports a problem, they can copy
// the traceId from the error they saw and you can grep
// your logs for that exact ID — instant debugging.

export class IopErrorDto {
  // HTTP status code — 400, 401, 403, 404, 500, etc.
  statusCode: number;

  // Human-readable error message — safe to show to users
  message: string;

  // Machine-readable error code — useful for frontend
  // to show the right error message in the right language
  // Examples: 'VALIDATION_ERROR', 'UNAUTHORIZED',
  //           'USER_NOT_FOUND', 'DATABASE_ERROR'
  errorCode: string;

  // ISO 8601 timestamp — when the error occurred
  // Useful for correlating with logs
  timestamp: string;

  // Which URL caused the error
  path: string;

  // The traceId from the request — THIS is the key field
  // for debugging. Paste this into grep and find every
  // log line from both services for this request.
  traceId: string;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string,
    path: string,
    traceId: string,
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    this.path = path;
    this.traceId = traceId;
  }
}

// ─── Error codes ─────────────────────────────────────────────────
// Centralised list of all error codes both services can use.
// Adding a new error type = add a constant here + handle it
// in error-handler.service.ts. No magic strings anywhere else.
export const ErrorCode = {
  // 400 errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',

  // 401 errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // 403 errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',

  // 404 errors
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // 409 errors
  CONFLICT: 'CONFLICT',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',

  // 500 errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
