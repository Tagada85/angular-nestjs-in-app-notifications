import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module.js';
import { NotifizzModule } from '../notifizz/notifizz.module.js';
import { InvoicesController } from './invoices.controller.js';
import { InvoicesService } from './invoices.service.js';

@Module({
  imports: [ClientsModule, NotifizzModule],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
