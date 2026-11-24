import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ClientSummary, CreateInvoiceRequest, Invoice, Session } from './models';

// The Angular dev server forwards /api to the NestJS backend (proxy.conf.json).
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listClients(): Observable<ClientSummary[]> {
    return this.http.get<ClientSummary[]>('/api/clients');
  }

  openSession(clientId: string): Observable<Session> {
    return this.http.post<Session>('/api/session', { clientId });
  }

  listInvoices(clientId?: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>('/api/invoices', { params: clientId ? { clientId } : {} });
  }

  getInvoice(invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(`/api/invoices/${encodeURIComponent(invoiceId)}`);
  }

  createInvoice(request: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>('/api/invoices', request);
  }

  suggestNextInvoiceNumber(): Observable<string> {
    return this.http.get<{ number: string }>('/api/invoices/next-number').pipe(map(({ number }) => number));
  }
}
