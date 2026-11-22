import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import type { Client } from '../clients/client.js';
import { CreateSessionDto } from './create-session.dto.js';
import { SessionService } from './session.service.js';

@Controller('session')
export class SessionController {
  constructor(private readonly session: SessionService) {}

  @Post()
  @HttpCode(200)
  open(@Body() { clientId }: CreateSessionDto): Client {
    return this.session.open(clientId);
  }
}
