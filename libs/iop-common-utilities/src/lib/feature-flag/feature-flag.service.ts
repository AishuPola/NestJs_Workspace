// libs/iop-common-utilities/src/lib/feature-flag/feature-flag.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { APP_CONFIG } from '../config/config.constants';
import { IAppConfig } from '../config/config.interfaces';

// ─── What is this file? ─────────────────────────────────────────
// Controls which features are active at runtime without
// redeploying the application.
//
// Week 5 use cases:
//   isEnabled('pubsub')  → should this request publish to RabbitMQ?
//   isEnabled('bullmq')  → should this job be queued in BullMQ?
//
// How to toggle:
//   .env: ENABLE_PUBSUB=false → restart → pub/sub is off
//   .env: ENABLE_PUBSUB=true  → restart → pub/sub is on
//
// Why this matters for your presentation:
//   You can demonstrate disabling pub/sub mid-demo without
//   touching any business logic code. The feature flag is the
//   only thing that changes. This is the Open/Closed principle
//   applied to feature delivery — open for extension (new flags),
//   closed for modification (existing code unchanged).

export type FeatureFlag = 'pubsub' | 'bullmq';

@Injectable()
export class FeatureFlagService {
  constructor(@Inject(APP_CONFIG) private readonly appConfig: IAppConfig) {}

  // ─── isEnabled() ──────────────────────────────────────────────
  // Returns true if the feature is active.
  // Called at the point of use — not at startup — so you can
  // toggle a flag and restart without changing any callers.
  isEnabled(flag: FeatureFlag): boolean {
    switch (flag) {
      case 'pubsub':
        return this.appConfig.enablePubSub;
      case 'bullmq':
        return this.appConfig.enableBullMq;
      default:
        return false;
    }
  }

  // ─── getAll()
  // Returns all flag states — used by the health check endpoint
  // so your manager can see which features are active at a glance
  getAll(): Record<FeatureFlag, boolean> {
    return {
      pubsub: this.isEnabled('pubsub'),
      bullmq: this.isEnabled('bullmq'),
    };
  }
}
