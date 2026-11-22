export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
}

export type ClientSummary = Pick<Client, 'id' | 'name' | 'company'>;

export interface Invoice {
  id: string;
  number: string;
  client: ClientSummary;
  description: string;
  /** Money travels in cents, as an integer. */
  amountInCents: number;
  currency: string;
  /** YYYY-MM-DD */
  dueDate: string;
  issuedAt: string;
}

export interface CreateInvoiceRequest {
  clientId: string;
  description: string;
  amountInCents: number;
  dueDate: string;
}
