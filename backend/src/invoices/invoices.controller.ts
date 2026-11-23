import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateInvoiceDto } from './create-invoice.dto.js';
import type { Invoice } from './invoice.js';
import { InvoicesService } from './invoices.service.js';
import { ListInvoicesQuery } from './list-invoices.query.js';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto): Invoice {
    return this.invoices.create(dto);
  }

  /** The number the billing form proposes. The team can change it before creating the invoice. */
  @Get('next-number')
  suggestNextNumber(): { number: string } {
    return { number: this.invoices.suggestNextNumber() };
  }

  // Demo only: no authentication, so anyone can list any client's invoices.
  @Get()
  findAll(@Query() { clientId }: ListInvoicesQuery): Invoice[] {
    return clientId ? this.invoices.findByClient(clientId) : this.invoices.findAll();
  }
}
