import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { toSummary } from '../clients/client.js';
import { ClientsService } from '../clients/clients.service.js';
import type { CreateInvoiceDto } from './create-invoice.dto.js';
import { INVOICE_CURRENCY, type Invoice } from './invoice.js';

@Injectable()
export class InvoicesService {
  // Kept in memory: the invoices disappear when the server restarts.
  private readonly invoices: Invoice[] = [];
  private lastSequence = 0;

  constructor(private readonly clients: ClientsService) {}

  create({ clientId, description, amountInCents, dueDate }: CreateInvoiceDto): Invoice {
    const client = this.clients.findById(clientId);
    if (!client) throw new BadRequestException('Unknown client');

    const issuedAt = new Date();
    const invoice: Invoice = {
      id: randomUUID(),
      number: this.nextNumber(issuedAt),
      client: toSummary(client),
      description,
      amountInCents,
      currency: INVOICE_CURRENCY,
      dueDate,
      issuedAt: issuedAt.toISOString(),
    };
    this.invoices.unshift(invoice);
    return invoice;
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

  private nextNumber(issuedAt: Date): string {
    this.lastSequence += 1;
    return `INV-${issuedAt.getUTCFullYear()}-${String(this.lastSequence).padStart(4, '0')}`;
  }
}
