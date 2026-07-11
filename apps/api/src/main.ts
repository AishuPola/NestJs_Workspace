import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {
  TraceIdMiddleware,
  LoggingInterceptor,
  ErrorHandlerService,
  LoggerService,
} from '@my-nest-workspace/iop-common-utilities';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Week 4 — TraceId must run first
  app.use((req: any, res: any, next: any) =>
    new TraceIdMiddleware().use(req, res, next),
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Week 4 — Logging + Error handling
  const loggerService = app.get(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));
  app.useGlobalFilters(new ErrorHandlerService(loggerService));

  const port = parseInt(process.env.PORT || '3000');
  await app.listen(port);
  Logger.log(`API service running on http://localhost:${port}`);
  Logger.log(`Bull Board: http://localhost:${port}/admin/queues`);
}

bootstrap();
