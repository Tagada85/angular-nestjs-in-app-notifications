export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
}

export type ClientSummary = Pick<Client, 'id' | 'name' | 'company'>;

/** The Notifizz bell options, prepared by the backend: the token is signed over the client id. */
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

export const INVOICE_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;
export type InvoiceCurrency = (typeof INVOICE_CURRENCIES)[number];

export interface Invoice {
  id: string;
  number: string;
  client: ClientSummary;
  description: string;
  /** Money travels in cents, as an integer. */
  amountInCents: number;
  currency: InvoiceCurrency;
  /** YYYY-MM-DD */
  dueDate: string;
  issuedAt: string;
}

export interface CreateInvoiceRequest {
  number: string;
  clientId: string;
  description: string;
  amountInCents: number;
  currency: InvoiceCurrency;
  dueDate: string;
}
