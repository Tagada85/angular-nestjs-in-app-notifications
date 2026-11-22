import { Controller, Get } from '@nestjs/common';
import { toSummary, type ClientSummary } from './client.js';
import { ClientsService } from './clients.service.js';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clients: ClientsService) {}

  @Get()
  findAll(): ClientSummary[] {
    return this.clients.findAll().map(toSummary);
  }
}
