import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { DbModule } from './db/db.module.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [DbModule, HealthModule, AuthModule, ProductsModule],
  controllers: [AppController],
})
export class AppModule {}
