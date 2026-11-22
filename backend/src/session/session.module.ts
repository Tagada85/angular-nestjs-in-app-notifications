import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module.js';
import { SessionController } from './session.controller.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [ClientsModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
