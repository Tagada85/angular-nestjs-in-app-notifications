import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { Invoice } from '../shared/models';

/** The page a payment link opens, e.g. from a notification: /pay/:invoiceId */
@Component({
  selector: 'app-pay-page',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './pay-page.html'
})
export class PayPage implements OnInit {
  /** From the route: /pay/:invoiceId */
  readonly invoiceId = input.required<string>();

  private readonly api = inject(ApiService);

  protected readonly invoice = signal<Invoice | null>(null);
  protected readonly notFound = signal(false);

  ngOnInit(): void {
    this.api.getInvoice(this.invoiceId()).subscribe({
      next: (invoice) => this.invoice.set(invoice),
      error: () => this.notFound.set(true)
    });
  }
}
