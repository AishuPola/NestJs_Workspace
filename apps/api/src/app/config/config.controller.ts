// apps/api/src/app/config/config.controller.ts

import { Controller, Get, Inject } from '@nestjs/common';
import {
  APP_CONFIG,
  IAppConfig,
  NodeEnv,
} from '@my-nest-workspace/iop-common-utilities';

@Controller('config')
export class ConfigController {
  constructor(@Inject(APP_CONFIG) private readonly appConfig: IAppConfig) {}

  // GET /config/info
  // Returns only NON-SENSITIVE config — safe to expose
  @Get('info')
  getConfigInfo() {
    return {
      environment: this.appConfig.nodeEnv,
      isProduction: this.appConfig.nodeEnv === NodeEnv.PRODUCTION,
      port: this.appConfig.port,
      appName: this.appConfig.appName,
      appVersion: this.appConfig.appVersion,
      jwtExpiresIn: this.appConfig.jwtExpiresIn,
      timestamp: new Date().toISOString(),
    };
  }
}
