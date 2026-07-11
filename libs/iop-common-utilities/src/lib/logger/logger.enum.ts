// libs/iop-common-utilities/src/lib/logger/logger.enum.ts

// What is this file?=
// Defines the four standard log levels as a typed enum.
// Same pattern as UserRole, NodeEnv, DbConnectionStatus from
// previous weeks — a string enum catches typos at compile time
// instead of silently logging to the wrong level at runtime.
//
// Log levels have a strict hierarchy — each level includes
// everything above it:
//   ERROR → only errors
//   WARN  → warnings + errors
//   INFO  → general info + warnings + errors
//   DEBUG → everything, including low-level detail
//
// In production you'd set NODE_ENV=production and log only
// INFO and above. In development you log DEBUG and above.
// Your AppConfig (Week 2) already has nodeEnv — LoggerService
// will use it to pick the right level automatically.

export enum LogLevel {
  ERROR = 'error',
  // Something broke and needs immediate attention.
  // Examples: database connection failed, JWT signing failed,
  // unhandled exception caught by the global exception filter.
  // Always logged in every environment.

  WARN = 'warn',
  // Something unexpected happened but the app kept running.
  // Examples: a deprecated endpoint was called, a retry
  // succeeded after an initial failure, config value is
  // using its default because .env didn't set it.

  INFO = 'info',
  // Normal, expected events worth recording.
  // Examples: server started, user registered, request
  // received, notification sent. This is what you'd
  // filter on during a normal production investigation.

  DEBUG = 'debug',
  // Detailed internal state — too noisy for production.
  // Examples: SQL query parameters, JWT payload contents,
  // middleware execution order. Only logged in development.
}
