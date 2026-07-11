import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import {
  AuthGuard,
  RolesGuard,
  Roles,
  UserRole,
  AuthService,
  SafeUser,
} from '@my-nest-workspace/iop-common-utilities';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    username: string;
    role: UserRole;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  // GET /users/profile — any authenticated user
  @Get('profile')
  @UseGuards(AuthGuard)
  async getProfile(@Request() req): Promise<SafeUser> {
    return this.authService.getProfile(req.user.userId); // works the same, just typed differently now
  }

  // GET /users — ADMIN only, returns all users
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers(): Promise<SafeUser[]> {
    return this.authService.findAll();
  }

  // GET /users/admin-dashboard — ADMIN or MODERATOR
  @Get('admin-dashboard')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  adminDashboard(@Request() req: AuthenticatedRequest): {
    message: string;
    role: string;
    accessLevel: string;
  } {
    return {
      message: `Welcome to admin dashboard, ${req.user.username}`,
      role: req.user.role,
      accessLevel: req.user.role === UserRole.ADMIN ? 'full' : 'limited',
    };
  }
}
