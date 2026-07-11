import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqplib from 'amqplib';
import { IopEvent } from './pub-sub-response.dto';
import { LoggerService } from '../logger/logger.service';
import { APP_CONFIG } from '../config/config.constants';
import { IAppConfig } from '../config/config.interfaces';

export const EXCHANGE_NAME = 'iop.events';
export const NOTIFICATION_QUEUE_NAME = 'notification.queue';

@Injectable()
export class PubSubPublisherService implements OnModuleInit, OnModuleDestroy {
  // Use broader any types to avoid mismatches between amqplib type versions
  private connection: any = null;
  private channel: any = null;
  private isReady = false;

  constructor(
    @Inject(APP_CONFIG) private readonly appConfig: IAppConfig,
    private readonly loggerService: LoggerService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Log the actual value so we can verify it's really true
    console.log(
      '[PubSubPublisher] enablePubSub =',
      this.appConfig.enablePubSub,
    );

    if (!this.appConfig.enablePubSub) {
      console.log('[PubSubPublisher] PubSub is DISABLED — skipping connection');
      return;
    }

    try {
      console.log(
        '[PubSubPublisher] Connecting to',
        this.appConfig.rabbitmqUrl,
      );
      this.connection = (await amqplib.connect(
        this.appConfig.rabbitmqUrl,
      )) as any;
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(EXCHANGE_NAME, 'fanout', {
        durable: true,
      });

      await this.channel.assertQueue(NOTIFICATION_QUEUE_NAME, {
        durable: true,
      });

      await this.channel.bindQueue(NOTIFICATION_QUEUE_NAME, EXCHANGE_NAME, '');

      this.isReady = true;
      console.log('[PubSubPublisher] ✓ Connected and ready');

      this.loggerService.info(
        `RabbitMQ ready — '${EXCHANGE_NAME}' → '${NOTIFICATION_QUEUE_NAME}'`,
        {},
      );
    } catch (error) {
      console.error(
        '[PubSubPublisher] Connection failed:',
        (error as Error).message,
      );
      this.loggerService.warn('Failed to connect to RabbitMQ', {
        error: (error as Error).message,
      });
    }
  }

  async publish(event: IopEvent): Promise<void> {
    console.log('[PubSubPublisher] publish() called, isReady =', this.isReady);

    if (!this.isReady || !this.channel) {
      console.warn('[PubSubPublisher] Not ready — cannot publish');
      return;
    }

    try {
      // NestJS microservices envelope — CRITICAL
      // @EventPattern() matches on the 'pattern' field
      // @Payload() receives the 'data' field
      const envelope = {
        pattern: event.type,
        data: event,
      };

      const buffer = Buffer.from(JSON.stringify(envelope));

      this.channel.publish(EXCHANGE_NAME, '', buffer, {
        persistent: true,
        contentType: 'application/json',
        headers: { 'x-trace-id': event.traceId },
      });

      console.log(
        '[PubSubPublisher] ✓ Published:',
        event.type,
        'traceId:',
        event.traceId,
      );

      this.loggerService.info(
        `Published: ${event.type}`,
        { exchange: EXCHANGE_NAME },
        event.traceId,
      );
    } catch (error) {
      console.error(
        '[PubSubPublisher] publish error:',
        (error as Error).message,
      );
      this.loggerService.error(
        `Failed to publish ${event.type}`,
        { error: (error as Error).message },
        event.traceId,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch {
      /* ignore */
    }
  }
}
