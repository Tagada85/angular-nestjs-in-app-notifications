import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // The Angular dev server forwards /api to this server (frontend/proxy.conf.json): no CORS needed.
  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
