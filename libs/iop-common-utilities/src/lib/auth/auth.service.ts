// // libs/iop-common-utilities/src/lib/auth/auth.service.ts
// // Add HttpService injection and notification call

// import {
//   Injectable,
//   UnauthorizedException,
//   ConflictException,
//   NotFoundException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { HttpService } from '@nestjs/axios';
// import * as bcrypt from 'bcryptjs';
// import { UserRole } from './auth.enum';
// import { UserRepository } from './user.repository';
// import { User } from './user.entity';
// import { LoggerService } from '../logger/logger.service';
// import { TRACE_ID_HEADER } from '../logger/trace-id.middleware';
// import { firstValueFrom } from 'rxjs';

// export type SafeUser = Omit<User, 'passwordHash'>;

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly jwtService: JwtService,
//     private readonly userRepository: UserRepository,
//     private readonly loggerService: LoggerService,
//     private readonly httpService: HttpService,
//     // ↑ NEW — used to call notification-service
//   ) {}

//   async register(
//     username: string,
//     email: string,
//     password: string,
//     role: UserRole = UserRole.USER,
//     traceId?: string, // ← NEW parameter
//   ): Promise<SafeUser> {
//     this.loggerService.info(
//       'Registering new user',
//       { username, email, role },
//       traceId,
//     );

//     const emailExists = await this.userRepository.findByEmail(email);
//     if (emailExists) {
//       throw new ConflictException(`Email '${email}' is already registered`);
//     }

//     const usernameExists = await this.userRepository.findByUsername(username);
//     if (usernameExists) {
//       throw new ConflictException(`Username '${username}' is already taken`);
//     }

//     const passwordHash = await bcrypt.hash(password, 10);

//     const newUser = await this.userRepository.create({
//       username,
//       email,
//       passwordHash,
//       role,
//     });

//     this.loggerService.info(
//       'User registered successfully',
//       { userId: newUser.id, username },
//       traceId,
//     );

//     // ── Call notification service — forwarding the traceId ──
//     // Fire-and-forget with catch — if notification fails,
//     // registration still succeeds (user is already saved)
//     this.callNotificationService(newUser.id, email, traceId).catch((err) => {
//       this.loggerService.warn(
//         'Failed to call notification service',
//         { error: err.message },
//         traceId,
//       );
//     });

//     const { passwordHash: _, ...safeUser } = newUser;
//     return safeUser;
//   }

//   // callNotificationService
//   // Calls notification-service with X-Trace-Id forwarded
//   // so both services' logs share the same traceId
//   private async callNotificationService(
//     userId: number,
//     email: string,
//     traceId?: string,
//   ): Promise<void> {
//     await firstValueFrom(
//       this.httpService.post(
//         'http://localhost:3001/notify',
//         {
//           type: 'WELCOME',
//           userId,
//           email,
//         },
//         {
//           headers: {
//             // This is the critical line — forwarding the traceId
//             // so notification-service logs show the same ID
//             [TRACE_ID_HEADER]: traceId || '',
//           },
//         },
//       ),
//     );
//   }

//   async login(email: string, password: string, traceId?: string) {
//     this.loggerService.info('Login attempt', { email }, traceId);

//     const user = await this.userRepository.findByEmail(email);
//     if (!user) throw new UnauthorizedException('Invalid credentials');

//     const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
//     if (!isPasswordValid)
//       throw new UnauthorizedException('Invalid credentials');

//     const payload = {
//       sub: user.id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     };
//     const { passwordHash: _, ...safeUser } = user;

//     this.loggerService.info('Login successful', { userId: user.id }, traceId);

//     return { access_token: this.jwtService.sign(payload), user: safeUser };
//   }

//   async findById(id: number): Promise<User | null> {
//     return this.userRepository.findById(id);
//   }

//   async findAll(): Promise<SafeUser[]> {
//     const users = await this.userRepository.findAll();
//     return users.map(({ passwordHash: _, ...safe }) => safe);
//   }

//   async getProfile(userId: number): Promise<SafeUser> {
//     const user = await this.findById(userId);
//     if (!user) throw new NotFoundException('User not found');
//     const { passwordHash: _, ...safe } = user;
//     return safe;
//   }
// }
// libs/iop-common-utilities/src/lib/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
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

// Week 4 HTTP import — commented out, replaced by pub/sub
// import { HttpService } from '@nestjs/axios';
// import { firstValueFrom } from 'rxjs';
// import { TRACE_ID_HEADER } from '../logger/trace-id.middleware';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
    private readonly pubSubPublisher: PubSubPublisherService,
    // ↑ Week 5 — replaces HttpService
    private readonly featureFlag: FeatureFlagService,
    // ↑ Week 5 — controls whether pub/sub runs
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
    if (emailExists)
      throw new ConflictException(`Email '${email}' is already registered`);

    const usernameExists = await this.userRepository.findByUsername(username);
    if (usernameExists)
      throw new ConflictException(`Username '${username}' is already taken`);

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
    console.log(
      'FEATURE FLAG enablePubSub:',
      this.featureFlag.isEnabled('pubsub'),
    );

    console.log(
      '[AuthService] About to check pubsub flag:',
      this.featureFlag.isEnabled('pubsub'),
    );
    // console.log('APP CONFIG enablePubSub:', this.appConfig);

    // ── Week 5: Publish event via RabbitMQ ────────────────────
    // Feature flag guards the publish call — if ENABLE_PUBSUB=false
    // this block is skipped entirely, registration still works.
    // Week 4 direct HTTP call is commented below for reference.
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

      console.log('[AuthService] Publishing event:', event.type);
      // Fire-and-forget — if RabbitMQ is down, registration
      // still succeeds. The warning is logged but no error thrown.
      this.pubSubPublisher.publish(event).catch((err) => {
        this.loggerService.warn(
          'Failed to publish user.registered event',
          { error: err.message },
          traceId,
        );
      });
    }

    // Week 4 direct HTTP call — replaced by pub/sub above
    // this.callNotificationService(newUser.id, email, traceId).catch(...)

    const { passwordHash: _, ...safeUser } = newUser;
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

    // Publish login event if pub/sub is enabled
    if (this.featureFlag.isEnabled('pubsub')) {
      const event: UserLoggedInEvent = {
        type: EventName.USER_LOGGED_IN,
        userId: user.id,
        email: user.email,
        traceId: traceId || '',
        timestamp: new Date().toISOString(),
      };
      console.log('[AuthService] Publishing event:', event.type);
      this.pubSubPublisher.publish(event).catch((error) => {
        this.loggerService.warn(
          'Failed to publish login event',
          { error },
          traceId,
        );
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    return { access_token: this.jwtService.sign(payload), user: safeUser };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepository.findAll();
    return users.map(({ passwordHash: _, ...safe }) => safe);
  }

  async getProfile(userId: number): Promise<SafeUser> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _, ...safe } = user;
    return safe;
  }
}
