import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { toSummary } from '../clients/client.js';
import { ClientsService } from '../clients/clients.service.js';
import type { CreateInvoiceDto } from './create-invoice.dto.js';
import type { Invoice } from './invoice.js';
import { isSameInvoiceNumber, suggestNextInvoiceNumber } from './invoice-number.js';

@Injectable()
export class InvoicesService {
  // Kept in memory: the invoices disappear when the server restarts.
  private readonly invoices: Invoice[] = [];

  constructor(private readonly clients: ClientsService) {}

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
    return invoice;
  }

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

  /** Newest first. */
  findByClient(clientId: string): Invoice[] {
    if (!this.clients.findById(clientId)) throw new NotFoundException('Unknown client');
    return this.invoices.filter((invoice) => invoice.client.id === clientId);
  }
}
