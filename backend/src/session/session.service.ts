import { Injectable, NotFoundException } from '@nestjs/common';
import { NotifizzClient } from '@notifizz/nodejs';
import type { Client } from '../clients/client.js';
import { ClientsService } from '../clients/clients.service.js';
import { notifizzKeys } from '../notifizz/notifizz-keys.js';

/** The options of the Notifizz bell, ready to pass to <notifizz-bell [options]>. */
export interface BellOptions {
  apiKey: string;
  authType: 'backendToken';
  userId: string;
  userEmail: string;
  token: string;
}

export interface Session {
  client: Client;
  bell: BellOptions;
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

    return {
      client,
      bell: {
        apiKey: notifizzKeys().frontApiKey,
        authType: 'backendToken',
        userId: client.id,
        userEmail: client.email,
        // Signed over the client id: the bell only opens the inbox of this client.
        token: this.notifizz.generateHashedToken(client.id),
      },
    };
  }
}
