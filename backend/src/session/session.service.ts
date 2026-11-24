import { Injectable, NotFoundException } from '@nestjs/common';
import { NotifizzClient } from '@notifizz/nodejs';
import type { Client } from '../clients/client.js';
import { ClientsService } from '../clients/clients.service.js';

export interface Session {
  client: Client;
  /** For the Notifizz bell (backendToken authentication): signed over the client id. */
  notifizzToken: string;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly clients: ClientsService,
    private readonly notifizz: NotifizzClient,
  ) {}

  // Demo only: anyone can open a client's space by sending their id.
  // A real app takes the client from its own authentication, never from the request.
  open(clientId: string): Session {
    const client = this.clients.findById(clientId);
    if (!client) throw new NotFoundException('Unknown client');

    return { client, notifizzToken: this.notifizz.generateHashedToken(client.id) };
  }
}
