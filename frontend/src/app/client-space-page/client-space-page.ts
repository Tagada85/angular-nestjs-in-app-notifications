import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { Client, Invoice } from '../shared/models';

@Component({
  selector: 'app-client-space-page',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './client-space-page.html'
})
export class ClientSpacePage implements OnInit {
  /** From the route: /clients/:clientId */
  readonly clientId = input.required<string>();

  private readonly api = inject(ApiService);

  protected readonly client = signal<Client | null>(null);
  protected readonly invoices = signal<Invoice[]>([]);
  protected readonly notFound = signal(false);

  ngOnInit(): void {
    this.api.openSession(this.clientId()).subscribe({
      next: (client) => {
        this.client.set(client);
        this.api.listInvoices(client.id).subscribe((invoices) => this.invoices.set(invoices));
      },
      error: () => this.notFound.set(true)
    });
  }
}
