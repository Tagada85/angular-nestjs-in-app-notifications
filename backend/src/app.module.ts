import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ClientsModule } from './clients/clients.module.js';
import { InvoicesModule } from './invoices/invoices.module.js';
import { SessionModule } from './session/session.module.js';

@Module({
  imports: [ClientsModule, SessionModule, InvoicesModule],
  providers: [
    {
      // Every request body is checked against its DTO; unknown fields are refused.
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    },
  ],
})
export class AppModule {}
