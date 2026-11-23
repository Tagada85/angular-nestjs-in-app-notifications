import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Client, ClientSummary, CreateInvoiceRequest, Invoice } from './models';

// The Angular dev server forwards /api to the NestJS backend (proxy.conf.json).
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  listClients(): Observable<ClientSummary[]> {
    return this.http.get<ClientSummary[]>('/api/clients');
  }

  openSession(clientId: string): Observable<Client> {
    return this.http.post<Client>('/api/session', { clientId });
  }

  listInvoices(clientId?: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>('/api/invoices', { params: clientId ? { clientId } : {} });
  }

  createInvoice(request: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>('/api/invoices', request);
  }

  suggestNextInvoiceNumber(): Observable<string> {
    return this.http.get<{ number: string }>('/api/invoices/next-number').pipe(map(({ number }) => number));
  }
}
