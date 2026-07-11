// libs/iop-common-utilities/src/lib/config/config.providers.ts

import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_CONFIG, SECRETS_CONFIG } from './config.constants';
import { IAppConfig, ISecretsConfig } from './config.interfaces';
import { NodeEnv } from './env-config.classes';

export const appConfigProvider: Provider = {
  provide: APP_CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): IAppConfig => {
    const rawEnablePubSub = configService.get('ENABLE_PUBSUB');
    const rawEnableBullMq = configService.get('ENABLE_BULLMQ');

    console.log('=== CONFIG PROVIDER RUNNING ===');
    console.log('ENABLE_PUBSUB raw:', JSON.stringify(rawEnablePubSub));
    console.log('ENABLE_BULLMQ raw:', JSON.stringify(rawEnableBullMq));
    console.log('RABBITMQ_URL:', configService.get('RABBITMQ_URL'));
    console.log('================================');

    return {
      nodeEnv: configService.get<NodeEnv>('NODE_ENV', NodeEnv.DEVELOPMENT),
      port: configService.get<number>('PORT', 3000),
      appName: configService.get<string>('APP_NAME', 'iop-api'),
      appVersion: configService.get<string>('APP_VERSION', '1.0.0'),
      jwtExpiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
      rabbitmqUrl: configService.get<string>(
        'RABBITMQ_URL',
        'amqp://guest:guest@localhost:5672',
      ),
      redisHost: configService.get<string>('REDIS_HOST', 'localhost'),
      redisPort: configService.get<number>('REDIS_PORT', 6379),
      enablePubSub: String(rawEnablePubSub).trim() === 'true',
      enableBullMq: String(rawEnableBullMq).trim() === 'true',
    };
  },
};

export const secretsConfigProvider: Provider = {
  provide: SECRETS_CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): ISecretsConfig => {
    return {
      jwtSecret: configService.get<string>('JWT_SECRET') as string,
      dbHost: configService.get<string>('DB_HOST') as string,
      dbPort: configService.get<number>('DB_PORT') as number,
      dbName: configService.get<string>('DB_NAME') as string,
      dbUser: configService.get<string>('DB_USER') as string,
      dbPassword: configService.get<string>('DB_PASSWORD') as string,
    };
  },
};

export const configProviders: Provider[] = [
  appConfigProvider,
  secretsConfigProvider,
];
