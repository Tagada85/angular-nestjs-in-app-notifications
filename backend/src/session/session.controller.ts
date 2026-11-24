import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { CreateSessionDto } from './create-session.dto.js';
import { SessionService, type Session } from './session.service.js';

@Controller('session')
export class SessionController {
  constructor(private readonly session: SessionService) {}

  @Post()
  @HttpCode(200)
  open(@Body() { clientId }: CreateSessionDto): Session {
    return this.session.open(clientId);
  }
}
