import type { ClientSummary } from '../clients/client.js';

export const INVOICE_CURRENCY = 'EUR';

export interface Invoice {
  id: string;
  /** Human-readable, e.g. INV-2026-0001. */
  number: string;
  client: ClientSummary;
  description: string;
  /** Money travels in cents, as an integer: no floating-point rounding. */
  amountInCents: number;
  currency: typeof INVOICE_CURRENCY;
  /** A calendar date, YYYY-MM-DD. */
  dueDate: string;
  issuedAt: string;
}
