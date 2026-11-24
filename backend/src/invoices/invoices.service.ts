import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotifizzClient } from '@notifizz/nodejs';
import { randomUUID } from 'node:crypto';
import { type Client, toSummary } from '../clients/client.js';
import { ClientsService } from '../clients/clients.service.js';
import type { CreateInvoiceDto } from './create-invoice.dto.js';
import type { Invoice } from './invoice.js';
import { isSameInvoiceNumber, suggestNextInvoiceNumber } from './invoice-number.js';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  // Kept in memory: the invoices disappear when the server restarts.
  private readonly invoices: Invoice[] = [];

  constructor(
    private readonly clients: ClientsService,
    private readonly notifizz: NotifizzClient,
  ) {}

  create({ number, clientId, description, amountInCents, currency, dueDate }: CreateInvoiceDto): Invoice {
    const client = this.clients.findById(clientId);
    if (!client) throw new BadRequestException('Unknown client');

    // The check and the insert stay in one synchronous block: two requests cannot both pass the check.
    if (this.invoices.some((invoice) => isSameInvoiceNumber(invoice.number, number))) {
      throw new ConflictException('Invoice number already used');
    }

    const invoice: Invoice = {
      id: randomUUID(),
      number,
      client: toSummary(client),
      description,
      amountInCents,
      currency,
      dueDate,
      issuedAt: new Date().toISOString(),
    };
    this.invoices.unshift(invoice);

    this.notifizz
      .track(
        'invoice.created',
        {
          clientId: client.id,
          clientName: client.name,
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          invoiceAmount: invoice.amountInCents / 100,
          invoiceCurrency: invoice.currency,
          dueDate: invoice.dueDate,
        },
      )
      .catch((error: unknown) =>
        this.logger.error(`invoice.created not sent for ${invoice.number}: ${String(error)}`),
      );
    return invoice;
  }

  /**
   * Tells Notifizz an invoice was created. Notifizz finds the campaigns listening to this event and
   * notifies the client: the recipient is in the event (userId, email), no campaign id in the code.
   * Not awaited: the invoice is created even when Notifizz is slow or down, and a failure is logged.
   */

  suggestNextNumber(): string {
    return suggestNextInvoiceNumber(
      this.invoices.map((invoice) => invoice.number),
      new Date(),
    );
  }

  /** Newest first. */
  findAll(): Invoice[] {
    return [...this.invoices];
  }

  findById(id: string): Invoice {
    const invoice = this.invoices.find((candidate) => candidate.id === id);
    if (!invoice) throw new NotFoundException('Unknown invoice');
    return invoice;
  }

  /** Newest first. */
  findByClient(clientId: string): Invoice[] {
    if (!this.clients.findById(clientId)) throw new NotFoundException('Unknown client');
    return this.invoices.filter((invoice) => invoice.client.id === clientId);
  }
}
