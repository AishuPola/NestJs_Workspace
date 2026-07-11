// // libs/iop-common-utilities/src/lib/auth/auth.module.ts

// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { HttpModule } from '@nestjs/axios';
// import { AuthService } from './auth.service';
// import { JwtStrategy } from './jwt.strategy';
// import { AuthGuard } from './auth.guard';
// import { RolesGuard } from './roles.guard';
// import { UserRepository } from './user.repository';
// import { User } from './user.entity';
// import { SECRETS_CONFIG, APP_CONFIG } from '../config/config.constants';
// import { ISecretsConfig, IAppConfig } from '../config/config.interfaces';
// // ← LoggerModule removed — it is @Global() so LoggerService
// //   is already available once the app registers it

// @Module({
//   imports: [
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     TypeOrmModule.forFeature([User]),
//     HttpModule,
//     JwtModule.registerAsync({
//       inject: [SECRETS_CONFIG, APP_CONFIG],
//       useFactory: (secrets: ISecretsConfig, appConfig: IAppConfig) => ({
//         secret: secrets.jwtSecret,
//         signOptions: { expiresIn: appConfig.jwtExpiresIn as any },
//       }),
//     }),
//   ],
//   providers: [AuthService, JwtStrategy, AuthGuard, RolesGuard, UserRepository],
//   exports: [AuthService, AuthGuard, RolesGuard, JwtModule, PassportModule],
// })
// export class AuthModule {}
// libs/iop-common-utilities/src/lib/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { SECRETS_CONFIG, APP_CONFIG } from '../config/config.constants';
import { ISecretsConfig, IAppConfig } from '../config/config.interfaces';

// Week 4 HttpModule removed — replaced by PubSubPublisherModule
// PubSubPublisherModule and FeatureFlagModule are @Global()
// so they're available here without importing explicitly

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
    // HttpModule removed — Week 5 uses pub/sub instead
    JwtModule.registerAsync({
      inject: [SECRETS_CONFIG, APP_CONFIG],
      useFactory: (secrets: ISecretsConfig, appConfig: IAppConfig) => ({
        secret: secrets.jwtSecret,
        signOptions: { expiresIn: appConfig.jwtExpiresIn as any },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, AuthGuard, RolesGuard, UserRepository],
  exports: [AuthService, AuthGuard, RolesGuard, JwtModule, PassportModule],
})
export class AuthModule {}
