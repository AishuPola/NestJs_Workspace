// libs/iop-common-utilities/src/lib/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
  Optional,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './auth.enum';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { LoggerService } from '../logger/logger.service';
import { PubSubPublisherService } from '../pub-sub/pub-sub-publisher.service';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import {
  EventName,
  UserRegisteredEvent,
  UserLoggedInEvent,
} from '../pub-sub/pub-sub-response.dto';

export type SafeUser = Omit<User, 'passwordHash'>;

// Injection token for the queue service
// Optional because notification-service doesn't have BullMQ
export const QUEUE_SERVICE_TOKEN = 'QUEUE_SERVICE_TOKEN';

export interface IQueueService {
  addWelcomeJob(data: {
    userId: number;
    email: string;
    username: string;
    traceId: string;
  }): Promise<void>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly pubSubPublisher: PubSubPublisherService,
    private readonly featureFlag: FeatureFlagService,
    @Optional()
    @Inject(QUEUE_SERVICE_TOKEN)
    private readonly queueService: IQueueService | null,
    // ↑ Optional — notification-service doesn't inject this
    // Only the API service provides it via NotificationQueueModule
  ) {}

  async register(
    username: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER,
    traceId?: string,
  ): Promise<SafeUser> {
    this.loggerService.info(
      'Registering new user',
      { username, email, role },
      traceId,
    );

    const emailExists = await this.userRepository.findByEmail(email);
    if (emailExists) {
      throw new ConflictException(`Email '${email}' is already registered`);
    }

    const usernameExists = await this.userRepository.findByUsername(username);
    if (usernameExists) {
      throw new ConflictException(`Username '${username}' is already taken`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await this.userRepository.create({
      username,
      email,
      passwordHash,
      role,
    });

    this.loggerService.info(
      'User registered successfully',
      { userId: newUser.id, username },
      traceId,
    );

    // ── Week 5: Publish RabbitMQ event ─────────────────────────
    this.loggerService.debug(
      '[AuthService] enablePubSub check',
      { pubsubEnabled: this.featureFlag.isEnabled('pubsub') },
      traceId,
    );

    if (this.featureFlag.isEnabled('pubsub')) {
      const event: UserRegisteredEvent = {
        type: EventName.USER_REGISTERED,
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        traceId: traceId || '',
        timestamp: new Date().toISOString(),
      };
      // this pubSubPublisher.publish(event) is called.
      this.pubSubPublisher.publish(event).catch((err) => {
        this.loggerService.warn(
          'Failed to publish user.registered event',
          { error: err.message },
          traceId,
        );
      });
    }

    // ── Week 5: Add BullMQ background job ──────────────────────
    this.loggerService.debug(
      '[AuthService] enableBullMq check',
      {
        bullmqEnabled: this.featureFlag.isEnabled('bullmq'),
        hasQueueService: !!this.queueService,
      },
      traceId,
    );

    if (this.featureFlag.isEnabled('bullmq') && this.queueService) {
      this.queueService
        .addWelcomeJob({
          userId: newUser.id,
          email: newUser.email,
          username: newUser.username,
          traceId: traceId || '',
        })
        .catch((err) => {
          this.loggerService.warn(
            'Failed to add welcome job to queue',
            { error: err.message },
            traceId,
          );
        });
    }

    void newUser.passwordHash; // Exclude from SafeUser type
    const safeUser: SafeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
    return safeUser;
  }

  async login(
    email: string,
    password: string,
    traceId?: string,
  ): Promise<{ access_token: string; user: SafeUser }> {
    this.loggerService.info('Login attempt', { email }, traceId);

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    this.loggerService.info('Login successful', { userId: user.id }, traceId);

    if (this.featureFlag.isEnabled('pubsub')) {
      const event: UserLoggedInEvent = {
        type: EventName.USER_LOGGED_IN,
        userId: user.id,
        email: user.email,
        traceId: traceId || '',
        timestamp: new Date().toISOString(),
      };
      this.pubSubPublisher.publish(event).catch((err) => {
        this.loggerService.warn(
          'Failed to publish user.logged-in event',
          { error: err.message },
          traceId,
        );
      });
    }

    void user.passwordHash; // Exclude from SafeUser type
    const safeUser: SafeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
    return { access_token: this.jwtService.sign(payload), user: safeUser };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }

  async getProfile(userId: number): Promise<SafeUser> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    void user.passwordHash; // Exclude from SafeUser type
    const safe: SafeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
    return safe;
  }
}
