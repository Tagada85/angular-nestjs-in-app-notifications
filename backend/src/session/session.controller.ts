import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import type { User } from '../users/user.js';
import { CreateSessionDto } from './create-session.dto.js';
import { SessionService } from './session.service.js';

@Controller('session')
export class SessionController {
  constructor(private readonly session: SessionService) {}

  @Post()
  @HttpCode(200)
  open(@Body() { userId }: CreateSessionDto): User {
    return this.session.open(userId);
  }
}
