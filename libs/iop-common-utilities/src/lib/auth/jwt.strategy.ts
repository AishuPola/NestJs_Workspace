// libs/iop-common-utilities/src/lib/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { SECRETS_CONFIG } from '../config/config.constants';
import { ISecretsConfig } from '../config/config.interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(SECRETS_CONFIG) secretsConfig: ISecretsConfig,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretsConfig.jwtSecret,
      // ↑ same secret source as auth.module.ts — no more
      // separate ConfigService.get('JWT_SECRET') call here
    });
  }

  async validate(payload: {
    sub: number;
    username: string;
    email: string;
    role: string;
  }) {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
