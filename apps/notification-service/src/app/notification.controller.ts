import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import {
  LoggerService,
  UserRegisteredEvent,
  UserLoggedInEvent,
} from '@my-nest-workspace/iop-common-utilities';

@Controller()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly loggerService: LoggerService,
  ) {}

  @EventPattern('user.registered')
  async handleUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    // Raw console.log so it always appears regardless of logger setup
    console.log(
      '[NotificationController] user.registered received',
      'traceId:',
      event?.traceId,
      'userId:',
      event?.userId,
    );

    try {
      this.loggerService.info(
        'Received user.registered event',
        { userId: event.userId, email: event.email },
        event.traceId,
      );

      await this.notificationService.handleUserRegistered(event);

      // Acknowledge only after successful processing
      channel.ack(originalMsg);

      console.log('[NotificationController] ✓ acked message');
    } catch (error) {
      console.error(
        '[NotificationController] error:',
        (error as Error).message,
      );
      this.loggerService.error(
        'Failed to process user.registered',
        { error: (error as Error).message },
        event?.traceId,
      );
      // false, false = don't batch nack, don't requeue
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('user.loggedin')
  async handleUserLoggedIn(
    @Payload() event: UserLoggedInEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    console.log(
      '[NotificationController] user.loggedin received',
      'traceId:',
      event?.traceId,
    );

    try {
      this.loggerService.info(
        'Received user.loggedin event',
        { userId: event.userId },
        event.traceId,
      );

      await this.notificationService.handleUserLoggedIn(event);
      channel.ack(originalMsg);
    } catch (error) {
      this.loggerService.error(
        'Failed to process user.loggedin',
        { error: (error as Error).message },
        event?.traceId,
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
