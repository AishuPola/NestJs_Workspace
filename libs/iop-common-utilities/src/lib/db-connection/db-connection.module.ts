// libs/iop-common-utilities/src/lib/db-connection/db-connection.module.ts

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_CONFIG, SECRETS_CONFIG } from '../config/config.constants';
import { IAppConfig, ISecretsConfig } from '../config/config.interfaces';
import { User } from '../auth/user.entity';
import { DbConnectionService } from './db-connection.service';
import { AppConfigModule } from '../config/config.module';

//
// This is the database equivalent of config.module.ts from Week 2.
// Same pattern: wire up an external dependency, validate it's
// configured correctly, and expose it through one importable module.
//
// Just like AppConfigModule was @Global() because almost every
// module eventually needs config, DbConnectionModule is @Global()
// because almost every feature module will eventually need
// database access.

@Global()
@Module({
  imports: [
    AppConfigModule,
    // TypeOrmModule.forRootAsync — same useFactory pattern as
    // JwtModule.registerAsync() from auth.module.ts in Week 2.
    // It waits for SECRETS_CONFIG and APP_CONFIG to be ready
    // (meaning Joi has ALREADY validated DB_HOST, DB_PASSWORD, etc.)
    // before attempting to connect to Postgres.
    TypeOrmModule.forRootAsync({
      inject: [SECRETS_CONFIG, APP_CONFIG],
      useFactory: (secrets: ISecretsConfig, appConfig: IAppConfig) => ({
        type: 'postgres',

        // These four values come from your .env file, already
        // validated by Joi before this factory ever runs
        host: secrets.dbHost,
        port: secrets.dbPort,
        username: secrets.dbUser,
        password: secrets.dbPassword,
        database: secrets.dbName,

        // entities — tells TypeORM which classes map to tables
        // As you add more entities (Week 4+), add them to this array
        entities: [User],
        autoLoadEntities: true,

        

        // synchronize — automatically updates the database schema
        // to match your entity classes on every app restart
        //
        //  CRITICAL: only true in development. In production this
        // can DROP COLUMNS or DATA if your entity changes — always
        // false in production, use migrations instead
        synchronize: appConfig.nodeEnv === 'development',

        // logging — prints every SQL query TypeORM runs to the console
        // Extremely useful while learning — you'll SEE the actual
        // SQL behind every repository call
        logging: appConfig.nodeEnv === 'development',
      }),
    }),
  ],
  providers: [DbConnectionService],
  exports: [DbConnectionService, TypeOrmModule],
})
export class DbConnectionModule {}
