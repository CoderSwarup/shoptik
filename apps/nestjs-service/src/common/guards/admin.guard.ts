import { Injectable, SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RolesGuard, ROLES_KEY } from './roles.guard.js';
import type { UserRole } from '../../db/schemas/users.js';

@Injectable()
class AdminGuardInternal extends RolesGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Set ADMIN role requirement before checking
    const requiredRoles: UserRole[] = ['ADMIN'];
    Reflect.defineMetadata(ROLES_KEY, requiredRoles, context.getHandler());
    return super.canActivate(context);
  }
}

import { ExecutionContext } from '@nestjs/common';

// Create a guard that requires ADMIN role
export function AdminGuard() {
  return applyDecorators(
    SetMetadata(ROLES_KEY, ['ADMIN']),
    UseGuards(RolesGuard)
  );
}
