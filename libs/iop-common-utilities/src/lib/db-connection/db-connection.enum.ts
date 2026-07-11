// libs/iop-common-utilities/src/lib/db-connection/db-connection.enum.ts

//
// Defines the possible states a database connection can be in.
// Used by db-connection.service.ts to report connection health,
// and by your health check endpoint to show this status to anyone
// checking if the app (and its database) is actually working.
//
// Same pattern as UserRole and NodeEnv from previous weeks —
// an enum instead of raw strings means TypeScript catches typos
// at compile time instead of silently comparing 'CONECTED' to
// 'CONNECTED' and getting it wrong forever.

export enum DbConnectionStatus {
  CONNECTED = 'CONNECTED',
  // The database connection is live and queries can be executed

  DISCONNECTED = 'DISCONNECTED',
  // No active connection — either never connected, or it was
  // intentionally closed (e.g. app shutting down gracefully)

  ERROR = 'ERROR',
  // A connection attempt was made but failed — wrong credentials,
  // database server unreachable, network issue, etc.

  CONNECTING = 'CONNECTING',
  // Connection attempt is in progress — useful for the brief
  // moment during app startup before the connection is confirmed
}
