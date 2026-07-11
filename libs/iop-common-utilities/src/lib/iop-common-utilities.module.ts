// // libs/iop-common-utilities/src/lib/iop-common-utilities.module.ts

// import { Module } from '@nestjs/common';
// import { AuthModule } from './auth/auth.module';
// import { AppConfigModule } from './config/config.module';
// import { DbConnectionModule } from './db-connection/db-connection.module';
// // LoggerModule is NOT imported here — each app registers it
// // with its own service name in its own root module

// @Module({
//   imports: [AppConfigModule, DbConnectionModule, AuthModule],
//   exports: [AppConfigModule, DbConnectionModule, AuthModule],
// })
// export class IopCommonUtilitiesModule {}
// libs/iop-common-utilities/src/lib/iop-common-utilities.module.ts

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { DbConnectionModule } from './db-connection/db-connection.module';
import { PubSubPublisherModule } from './pub-sub/pub-sub-publisher.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';

@Module({
  imports: [
    AppConfigModule,
    DbConnectionModule,
    PubSubPublisherModule, // ← Week 5
    FeatureFlagModule, // ← Week 5
    AuthModule,
  ],
  exports: [
    AppConfigModule,
    DbConnectionModule,
    PubSubPublisherModule, // ← Week 5
    FeatureFlagModule, // ← Week 5
    AuthModule,
  ],
})
export class IopCommonUtilitiesModule {}
