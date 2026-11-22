import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '../users/user.js';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class SessionService {
  constructor(private readonly users: UsersService) {}

  // Demo only: anyone can open a session as any user by sending their id.
  // A real app takes the user from its own authentication, never from the request.
  open(userId: string): User {
    const user = this.users.findById(userId);
    if (!user) throw new NotFoundException('Unknown user');
    return user;
  }
}
