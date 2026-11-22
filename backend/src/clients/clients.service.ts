import { Injectable } from '@nestjs/common';
import type { Client } from './client.js';

// Two hard-coded clients are enough to show that a notification reaches one client and not the other.
// The ids must stay stable: they identify the same person from one notification to the next.
// example.com is reserved for documentation: nothing is ever delivered there.
const CLIENTS: readonly Client[] = [
  { id: 'alice', name: 'Alice Martin', company: 'Globex', email: 'alice@example.com' },
  { id: 'bob', name: 'Bob Durand', company: 'Initech', email: 'bob@example.com' },
];

@Injectable()
export class ClientsService {
  findAll(): readonly Client[] {
    return CLIENTS;
  }

  findById(id: string): Client | undefined {
    return CLIENTS.find((client) => client.id === id);
  }
}
