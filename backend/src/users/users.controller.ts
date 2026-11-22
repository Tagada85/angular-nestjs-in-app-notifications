import { Controller, Get } from '@nestjs/common';
import { toSummary, type UserSummary } from './user.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(): UserSummary[] {
    return this.users.findAll().map(toSummary);
  }
}
