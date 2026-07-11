// libs/iop-common-utilities/src/lib/feature-flag/feature-flag.module.ts

import { Global, Module } from '@nestjs/common';
import { FeatureFlagService } from './feature-flag.service';

@Global()
@Module({
  providers: [FeatureFlagService],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
