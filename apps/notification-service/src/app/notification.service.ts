import { Injectable } from '@nestjs/common';
import {
  LoggerService,
  UserRegisteredEvent,
  UserLoggedInEvent,
} from '@my-nest-workspace/iop-common-utilities';

@Injectable()
export class NotificationService {
  constructor(private readonly loggerService: LoggerService) {}

  async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    this.loggerService.info(
      `Sending WELCOME notification to ${event.email}`,
      { userId: event.userId, username: event.username },
      event.traceId,
    );

    // Simulate notification sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.loggerService.info(
      `WELCOME notification sent successfully`,
      { userId: event.userId },
      event.traceId,
    );
  }

  async handleUserLoggedIn(event: UserLoggedInEvent): Promise<void> {
    this.loggerService.info(
      `Sending LOGIN ALERT to ${event.email}`,
      { userId: event.userId },
      event.traceId,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    this.loggerService.info(
      `LOGIN ALERT sent successfully`,
      { userId: event.userId },
      event.traceId,
    );
  }
}
