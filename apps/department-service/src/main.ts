import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import {
  TraceIdMiddleware,
  LoggingInterceptor,
  ErrorHandlerService,
  LoggerService,
} from '@my-nest-workspace/iop-common-utilities';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect to RabbitMQ — listens for employee events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'department.queue',
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: 1,
    },
  });

  app.use((req: any, res: any, next: any) =>
    new TraceIdMiddleware().use(req, res, next),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const loggerService = app.get(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));
  app.useGlobalFilters(new ErrorHandlerService(loggerService));

  await app.startAllMicroservices();
  const port = parseInt(process.env.PORT || '3003');
  await app.listen(port);
  Logger.log(`Department service HTTP on http://localhost:${port}`);
  Logger.log(`Department service RabbitMQ consumer started`);
}
bootstrap();
