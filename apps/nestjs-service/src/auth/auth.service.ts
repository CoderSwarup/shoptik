import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { users } from '../db/schemas/users.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import { DB_CLIENT } from '../db/db.module.js';
import type { Db } from '../db/index.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(@Inject(DB_CLIENT) private db: Db) {}

  async register(dto: RegisterDto) {
    const existing = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const [user] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: 'USER',
      })
      .returning();

    const { password: _, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async getCurrentUser(userId: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return null;
    }

    const { password: _, ...result } = user;
    return result;
  }
}
