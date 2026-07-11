import { SetMetadata } from '@nestjs/common';
import { UserRole } from './auth.enum.js';

export const ROLES_KEY = 'roles';

// @Roles(UserRole.ADMIN) — only admins can access
// @Roles(UserRole.ADMIN, UserRole.MODERATOR) — either role works
// TypeScript enforces only valid UserRole values — no typos possible
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
