export * from './lib/iop-common-utilities.js';
// Public API of the shared library
export { IopCommonUtilitiesModule } from './lib/iop-common-utilities.module.js';
export { AuthModule } from './lib/auth/auth.module.js';
export { AuthService } from './lib/auth/auth.service.js';
// export type { User, SafeUser } from './lib/auth/auth.service.js';

export { User } from './lib/auth/user.entity.js';
export type { SafeUser } from './lib/auth/auth.service.js';
export { AuthGuard } from './lib/auth/auth.guard.js';
export { RolesGuard } from './lib/auth/roles.guard.js';
export { UserRole } from './lib/auth/auth.enum.js';
export { Roles, ROLES_KEY } from './lib/auth/roles.decorator.js';
export { RegisterDto } from './lib/auth/dto/register.dto.js';
export { LoginDto } from './lib/auth/dto/login.dto.js';
// ─── Week 2 exports — Config & Secrets Management ─────────────

// The module itself — app.module.ts will import this
export { AppConfigModule } from './lib/config/config.module';

// Injection tokens — used with @Inject() anywhere you need config
// e.g. @Inject(APP_CONFIG) private config: IAppConfig
export {
  APP_CONFIG,
  SECRETS_CONFIG,
  DATABASE_CONFIG,
  FULL_CONFIG,
} from './lib/config/config.constants';

// TypeScript interfaces — give you autocomplete on injected config
// 'export type' because interfaces don't exist at runtime —
// they disappear after TypeScript compiles, so this must be
// a type-only export (same pattern as User/SafeUser above)
export type {
  IAppConfig,
  ISecretsConfig,
  IDatabaseConfig,
  IFullConfig,
} from './lib/config/config.interfaces';

// NodeEnv enum — used to check environment anywhere in the app
// e.g. if (appConfig.nodeEnv === NodeEnv.PRODUCTION) { ... }
export { NodeEnv } from './lib/config/env-config.classes';
// libs/iop-common-utilities/src/index.ts — add these to your existing exports

// Week 4 — Logger
export { LoggerModule, SERVICE_NAME } from './lib/logger/logger.module';
export { LoggerService } from './lib/logger/logger.service';
export { LogLevel } from './lib/logger/logger.enum';
export {
  TraceIdMiddleware,
  TRACE_ID_HEADER,
} from './lib/logger/trace-id.middleware';
export { LoggingInterceptor } from './lib/logger/logging.interceptor';

// Week 4 — Error handling
export { ErrorHandlerService } from './lib/error-handler/error-handler.service';
export { IopErrorDto, ErrorCode } from './lib/error-handler/iop-error.dto';
export type { ErrorCodeType } from './lib/error-handler/iop-error.dto';

// Add these to libs/iop-common-utilities/src/index.ts

// Week 5 — Pub/Sub
export { PubSubPublisherModule } from './lib/pub-sub/pub-sub-publisher.module';
export {
  PubSubPublisherService,
  EXCHANGE_NAME,
} from './lib/pub-sub/pub-sub-publisher.service';
export {
  EventName,
  UserRegisteredEvent,
  UserLoggedInEvent,
} from './lib/pub-sub/pub-sub-response.dto';
export type { IopEvent, BaseEvent } from './lib/pub-sub/pub-sub-response.dto';

// Week 5 — Feature flags
export { FeatureFlagModule } from './lib/feature-flag/feature-flag.module';
export { FeatureFlagService } from './lib/feature-flag/feature-flag.service';
export type { FeatureFlag } from './lib/feature-flag/feature-flag.service';
