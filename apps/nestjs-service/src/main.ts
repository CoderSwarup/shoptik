import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? 5001;
  await app.listen(port);

  console.log(`\n🚀 nestjs-service running on http://localhost:${port}`);
  console.log(`   GET /            → service manifest`);
  console.log(`   GET /health      → service health`);
  console.log(`   GET /health/db   → database health\n`);
}

bootstrap();
