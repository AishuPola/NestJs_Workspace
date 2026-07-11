// libs/iop-common-utilities/src/lib/db-connection/db-connection.service.ts

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DbConnectionStatus } from './db-connection.enum';

// ─── What is this file? ─────────────────────────────────────────
// A small service whose only job is to REPORT on the health of
// the database connection. It does not run business queries —
// that's what user.repository.ts is for (Single Responsibility,
// same principle from Week 1's guards).
//
// This service answers exactly one question: "Is the database
// actually reachable right now?" — used by your health check
// endpoint.

@Injectable()
export class DbConnectionService {
  // @InjectDataSource() gives you the raw TypeORM DataSource —
  // the same connection pool that TypeOrmModule.forRootAsync()
  // set up in db-connection.module.ts. This is NOT a repository,
  // it's the lower-level connection object underneath everything.
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  //  getStatus()
  // Checks if TypeORM successfully established the connection
  // when the app started. isInitialized becomes true only after
  // a real, successful handshake with Postgres.
  getStatus(): DbConnectionStatus {
    if (this.dataSource.isInitialized) {
      return DbConnectionStatus.CONNECTED;
    }
    return DbConnectionStatus.DISCONNECTED;
  }

  //  ping()
  // A more thorough check than getStatus(). isInitialized only
  // tells you the connection was opened once at startup — it
  // doesn't prove the database is responding RIGHT NOW. A network
  // blip or Postgres restart could leave isInitialized = true
  // while the connection is actually dead.
  //
  // ping() runs an actual trivial query to prove the connection
  // is alive at this exact moment. This is what your health
  // check endpoint should call before reporting "healthy."
  async ping(): Promise<DbConnectionStatus> {
    try {
      await this.dataSource.query('SELECT 1');
      return DbConnectionStatus.CONNECTED;
    } catch (error) {
      return DbConnectionStatus.ERROR;
    }
  }
}
