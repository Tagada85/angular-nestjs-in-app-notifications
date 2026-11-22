import { Injectable } from '@nestjs/common';
import type { User } from './user.js';

// Two hard-coded users are enough to show that a notification reaches one person and not the other.
// The ids must stay stable: they identify the same person from one notification to the next.
// example.com is reserved for documentation: nothing is ever delivered there.
const USERS: readonly User[] = [
  { id: 'alice', name: 'Alice', email: 'alice@example.com' },
  { id: 'bob', name: 'Bob', email: 'bob@example.com' },
];

@Injectable()
export class UsersService {
  findAll(): readonly User[] {
    return USERS;
  }

  findById(id: string): User | undefined {
    return USERS.find((user) => user.id === id);
  }
}
