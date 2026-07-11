// libs/iop-common-utilities/src/lib/config/config.interfaces.ts

// ─── What is this file? ───────────────────────────────────────
// TypeScript interfaces define the SHAPE of your config objects.
//
// The difference between interfaces and classes:
//
//   Class (env-config.classes.ts):
//     - Has decorators (@IsString, @IsNumber)
//     - Used at RUNTIME for validation
//     - class-validator reads the decorators and checks values
//
//   Interface (this file):
//     - Pure TypeScript — disappears at runtime (no JS generated)
//     - Used at COMPILE TIME for type safety
//     - Gives you autocomplete when injecting config anywhere
//
// You need BOTH:
//   Class  → validates the values are correct at startup
//   Interface → tells TypeScript what shape to expect everywhere else

import { NodeEnv } from './env-config.classes';

// ─── IAppConfig ───────────────────────────────────────────────
// Mirrors every property in AppConfig class exactly
// Used as the type when you @Inject(APP_CONFIG) anywhere
export interface IAppConfig {
  // The environment the app is running in
  // Type is NodeEnv enum — not just string
  // So req.app.nodeEnv === 'staging' is a compile error ✓
  nodeEnv: NodeEnv;

  // Port the HTTP server listens on
  // Already parsed to number — not string like raw .env
  port: number;

  // App identifier — appears in logs and health check response
  appName: string;

  // Semantic version string — e.g. '1.0.0'
  appVersion: string;

  // JWT token lifetime — e.g. '1d', '7d', '15m'
  jwtExpiresIn: string;

  rabbitmqUrl: string;
  redisHost: string;
  redisPort: number;
  enablePubSub: boolean;
  enableBullMq: boolean;
}

// ISecretsConfig
// Mirrors every property in SecretsConfig class exactly
// Used as the type when you @Inject(SECRETS_CONFIG) anywhere
export interface ISecretsConfig {
  // JWT signing secret — minimum 32 characters
  // Used in auth.module.ts to sign and verify tokens
  jwtSecret: string;

  // Database password — used in Week 3 db-connection module
  dbPassword: string;
}

// IDatabaseConfig
// Week 3 placeholder — defines the shape of DB connection config
// You don't implement this yet, but having the interface now means
// Week 3 db-connection module can import and use it immediately
export interface IDatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

//IFullConfig
// Combines everything into one master interface
// Useful when a module needs access to multiple config sections
// e.g. a health check controller that needs app + db info
export interface IFullConfig {
  app: IAppConfig;
  secrets: ISecretsConfig;
  database: IDatabaseConfig;
}
export interface ISecretsConfig {
  jwtSecret: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  dbPassword: string;
}
