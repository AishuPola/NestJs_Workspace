// libs/iop-common-utilities/src/lib/config/config.module.ts

import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.validation';
import { configProviders } from './config.providers';
import { APP_CONFIG, SECRETS_CONFIG } from './config.constants';

// What is this file?
// This is the final assembly point. It brings together:
//   1. NestJS's built-in ConfigModule (loads .env files)
//   2. Our Joi schema (validates the raw values at startup)
//   3. Our custom providers (maps validated values → typed objects)
//
// After this, your app's app.module.ts only needs ONE import:
//   AppConfigModule
// instead of manually wiring ConfigModule + validation + providers
// every time. This is reusability — exactly like AuthModule in Week 1.

//  @Global()
// This decorator means: once this module is imported ONCE
// (in app.module.ts), every other module in the app can inject
// APP_CONFIG or SECRETS_CONFIG WITHOUT importing this module again.
//
// This makes sense for config — it's truly global state that
// every part of the app might need, similar to how ConfigModule
// itself uses isGlobal: true.
@Global()
@Module({
  imports: [
    // NestJS's official ConfigModule — handles reading .env files
    NestConfigModule.forRoot({
      // isGlobal: true — ConfigService becomes available everywhere
      // without re-importing NestConfigModule in every module
      isGlobal: true,

      // envFilePath — load environment-specific file based on NODE_ENV
      // Falls back to '.env' if NODE_ENV-specific file doesn't exist
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],

      // validationSchema — THIS is what makes the app fail fast
      // Every raw .env value gets checked against config.validation.ts
      // before NestJS continues bootstrapping anything else
      validationSchema: configValidationSchema,

      // validationOptions — controls HOW errors are reported
      validationOptions: {
        // abortEarly: false means show ALL validation errors at once
        // instead of stopping at the first one — much better DX when
        // you have multiple missing/invalid env vars
        abortEarly: false,
      },
    }),
  ],

  // providers — our custom factories from config.providers.ts
  // These run AFTER NestConfigModule has validated everything above
  providers: [...configProviders],

  // exports — make APP_CONFIG and SECRETS_CONFIG injectable
  // anywhere that imports this module (or anywhere at all,
  // since @Global() is set)
  exports: [APP_CONFIG, SECRETS_CONFIG],
})
export class AppConfigModule {}
