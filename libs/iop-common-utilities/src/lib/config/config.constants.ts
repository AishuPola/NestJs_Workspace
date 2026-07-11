// libs/iop-common-utilities/src/lib/config/config.constants.ts

//  What is this file?
// NestJS dependency injection needs a unique "token" to identify
// each provider when you inject it using @Inject().
//
// For classes, NestJS can use the class itself as the token:
//   constructor(private authService: AuthService) {} // ← works automatically
//
// But for plain objects/values (like our config), there's no class
// to use as a token — so we create string constants instead.
//
// These constants are used in TWO places:
//   1. config.providers.ts  → registers the provider with this token
//   2. Anywhere you inject  → @Inject(APP_CONFIG) reads using this token

// Injection tokens
// Using 'as const' makes these literal string types, not just 'string'
// This gives TypeScript extra safety when matching tokens

export const APP_CONFIG = 'APP_CONFIG' as const;
// Used to inject the AppConfig object (port, nodeEnv, appName, etc.)

export const SECRETS_CONFIG = 'SECRETS_CONFIG' as const;
// Used to inject the SecretsConfig object (jwtSecret, dbPassword)

export const DATABASE_CONFIG = 'DATABASE_CONFIG' as const;
// Week 3 placeholder — will inject DB connection config

export const FULL_CONFIG = 'FULL_CONFIG' as const;
// Used when a module needs everything combined (app + secrets + db)
