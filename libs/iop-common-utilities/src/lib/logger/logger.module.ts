// libs/iop-common-utilities/src/lib/logger/logger.module.ts

import { Global, Module, DynamicModule } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggerService } from './logger.service';
import { LogLevel } from './logger.enum';

// SERVICE_NAME token — registered per-app, not inside logger.module
export const SERVICE_NAME = 'SERVICE_NAME';

// LoggerModuleOptions — what each app passes when registering
export interface LoggerModuleOptions {
  serviceName: string;
  isProduction?: boolean;
}

@Global()
@Module({})
export class LoggerModule {
  // Static register() — each app calls this with its own name
  // e.g. LoggerModule.register({ serviceName: 'api' })
  // e.g. LoggerModule.register({ serviceName: 'notification-service' })
  static register(options: LoggerModuleOptions): DynamicModule {
    const { serviceName, isProduction = false } = options;

    const level = isProduction ? LogLevel.INFO : LogLevel.DEBUG;

    const consoleFormat = isProduction
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        )
      : winston.format.combine(
          winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.colorize({ all: true }),
          winston.format.printf(
            ({ timestamp, level, message, traceId, ...meta }) => {
              const trace = traceId ? ` [traceId: ${traceId}]` : '';
              const metaStr = Object.keys(meta).length
                ? ' ' + JSON.stringify(meta)
                : '';
              return `${timestamp} ${level.padEnd(5)} [${serviceName}] ${message}${metaStr}${trace}`;
            },
          ),
        );

    return {
      module: LoggerModule,
      imports: [
        WinstonModule.forRoot({
          level,
          defaultMeta: { service: serviceName },
          transports: [
            new winston.transports.Console({ format: consoleFormat }),
            new winston.transports.File({
              filename: `logs/${serviceName}-error.log`,
              level: LogLevel.ERROR,
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
            new winston.transports.File({
              filename: `logs/${serviceName}-combined.log`,
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
              ),
            }),
          ],
        }),
      ],
      providers: [
        LoggerService,
        { provide: SERVICE_NAME, useValue: serviceName },
      ],
      exports: [LoggerService, SERVICE_NAME],
    };
  }
}
