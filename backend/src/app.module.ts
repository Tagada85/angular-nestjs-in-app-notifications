import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { KudosModule } from './kudos/kudos.module.js';
import { SessionModule } from './session/session.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [UsersModule, SessionModule, KudosModule],
  providers: [
    {
      // Every request body is checked against its DTO; unknown fields are refused.
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    },
  ],
})
export class AppModule {}
