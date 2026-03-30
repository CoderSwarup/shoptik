import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Db } from '../db/index.js';
import { DB_CLIENT } from '../db/db.module.js';

@Injectable()
export class HealthService {
  constructor(@Inject(DB_CLIENT) private readonly db: Db) {}

  getHealth() {
    return {
      service: 'nestjs-service',
      status: 'ok',
      version: '0.0.1',
      port: process.env.PORT ?? 5001,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
      stack: {
        runtime: 'NestJS v11 + Node.js',
        orm: 'Drizzle ORM',
        database: 'PostgreSQL 17',
        queue: 'BullMQ (Redis)',
      },
    };
  }

  async getDbHealth() {
    const start = Date.now();
    try {
      await this.db.execute(sql`SELECT 1`);
      const latencyMs = Date.now() - start;
      return {
        status: 'ok',
        database: 'PostgreSQL',
        connected: true,
        latencyMs,
        timestamp: new Date().toISOString(),
        tables: [
          'users',
          'addresses',
          'products',
          'orders',
          'order_items',
          'payments',
        ],
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Unknown database error';
      return {
        status: 'error',
        database: 'PostgreSQL',
        connected: false,
        error: message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
