import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator.js';
import { UserRole } from './auth.enum.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Read roles set by @Roles() on the route
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles() = authenticated users of any role can access
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // req.user is set by AuthGuard (JwtStrategy.validate()) before this runs
    const { user } = context.switchToHttp().getRequest();

    if (!requiredRoles.includes(user?.role)) {
      throw new ForbiddenException(
        `Access denied. Required: ${requiredRoles.join(', ')} — Your role: ${user?.role}`,
      );
    }

    return true;
  }
}
