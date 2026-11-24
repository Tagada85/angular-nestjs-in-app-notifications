import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { AppModule } from './app.module.js';
import { notifizzKeys } from './notifizz/notifizz-keys.js';

// Local development reads backend/.env. A real deployment sets these variables in its environment.
if (existsSync('.env')) process.loadEnvFile();
// Fails at startup when a Notifizz key is missing, rather than later with an empty bell.
notifizzKeys();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // The Angular dev server forwards /api to this server (frontend/proxy.conf.json): no CORS needed.
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
