import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
    credentials: true,
  });

  const port = process.env.PORT ?? 5001;
  await app.listen(port);

  console.log(`\n🚀 nestjs-service running on http://localhost:${port}`);
  console.log(`   GET /            → service manifest`);
  console.log(`   GET /health      → service health`);
  console.log(`   GET /health/db   → database health`);
  console.log(`   POST /auth/register   → register user`);
  console.log(`   POST /auth/login      → login user`);
  console.log(`   GET /auth/me          → get current user`);
  console.log(`   GET /products         → list all products`);
  console.log(`   GET /products/:id     → get single product`);
  console.log(`   POST /products        → create product [ADMIN]`);
  console.log(`   PUT /products/:id     → update product [ADMIN]`);
  console.log(`   DELETE /products/:id  → delete product [ADMIN]`);
  console.log(`   GET /addresses        → list user addresses`);
  console.log(`   POST /addresses       → create address`);
  console.log(`   PUT /addresses/:id    → update address`);
  console.log(`   DELETE /addresses/:id → delete address\n`);
}

bootstrap();
