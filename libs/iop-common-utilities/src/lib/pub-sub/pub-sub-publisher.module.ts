// libs/iop-common-utilities/src/lib/pub-sub/pub-sub-publisher.module.ts

import { Global, Module } from '@nestjs/common';
import { PubSubPublisherService } from './pub-sub-publisher.service';

// ─── What is this file? ─────────────────────────────────────────
// @Global() so PubSubPublisherService is injectable everywhere
// once imported in the root module — same pattern as LoggerModule
// and AppConfigModule from Weeks 2-4.

@Global()
@Module({
  providers: [PubSubPublisherService],
  exports: [PubSubPublisherService],
})
export class PubSubPublisherModule {}
