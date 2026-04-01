import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DB_CLIENT } from '../../db/db.module.js';
import { users, type UserRole } from '../../db/schemas/users.js';
import { eq } from 'drizzle-orm';
import type { Db } from '../../db/index.js';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => {
  return Reflect.metadata(ROLES_KEY, roles);
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DB_CLIENT) private db: Db,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      return false;
    }

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return false;
    }

    request.user = user;
    return requiredRoles.includes(user.role);
  }
}
