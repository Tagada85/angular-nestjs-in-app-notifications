import type { ClientSummary } from '../clients/client.js';

export const INVOICE_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export type InvoiceCurrency = (typeof INVOICE_CURRENCIES)[number];

export interface Invoice {
  id: string;
  /** Chosen by the billing team, unique: INV-2026-0001 by default. */
  number: string;
  client: ClientSummary;
  description: string;
  /** Money travels in cents, as an integer: no floating-point rounding. */
  amountInCents: number;
  currency: InvoiceCurrency;
  /** A calendar date, YYYY-MM-DD. */
  dueDate: string;
  issuedAt: string;
}
