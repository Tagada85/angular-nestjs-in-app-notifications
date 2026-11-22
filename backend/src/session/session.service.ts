import { Injectable, NotFoundException } from '@nestjs/common';
import type { Client } from '../clients/client.js';
import { ClientsService } from '../clients/clients.service.js';

@Injectable()
export class SessionService {
  constructor(private readonly clients: ClientsService) {}

  // Demo only: anyone can open a client's space by sending their id.
  // A real app takes the client from its own authentication, never from the request.
  open(clientId: string): Client {
    const client = this.clients.findById(clientId);
    if (!client) throw new NotFoundException('Unknown client');
    return client;
  }
}
