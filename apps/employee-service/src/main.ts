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
  app.use((req: any, res: any, next: any) =>
    new TraceIdMiddleware().use(req, res, next),
  );
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const loggerService = app.get(LoggerService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService));
  app.useGlobalFilters(new ErrorHandlerService(loggerService));
  const port = parseInt(process.env.PORT || '3002');
  await app.listen(port);
  Logger.log(`Employee service running on http://localhost:${port}`);
  Logger.log(`Bull Board: http://localhost:${port}/admin/queues`);
}
bootstrap();
