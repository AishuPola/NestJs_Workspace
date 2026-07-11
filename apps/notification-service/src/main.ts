import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationModule } from './app/notification.module';
import {
  TraceIdMiddleware,
  LoggingInterceptor,
  ErrorHandlerService,
  LoggerService,
} from '@my-nest-workspace/iop-common-utilities';

async function bootstrap() {
  const app = await NestFactory.create(NotificationModule);

  // Week 5 — RabbitMQ microservice listener
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'notification.queue',
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: 1,
    },
  });

  // Week 4 — Same observability stack as API service
  app.use((req: any, res: any, next: any) =>
    new TraceIdMiddleware().use(req, res, next),
  );

  const loggerService = app.get(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));
  app.useGlobalFilters(new ErrorHandlerService(loggerService));

  await app.startAllMicroservices();

  const port = parseInt(process.env.PORT || '3001');
  await app.listen(port);
  Logger.log(`Notification service HTTP on http://localhost:${port}`);
  Logger.log(`Notification service RabbitMQ consumer started`);
}

bootstrap();
