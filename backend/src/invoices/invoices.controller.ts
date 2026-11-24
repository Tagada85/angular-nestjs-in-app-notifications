import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
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

  // Declared after `next-number`: Express matches routes in order, and `:id` would catch it.
  // Demo only: anyone with the link sees the invoice. Its id is a random UUID, so it cannot be
  // guessed, but a real app also checks that the logged-in client owns it.
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Invoice {
    return this.invoices.findById(id);
  }
}
