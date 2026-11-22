import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { ClientSummary, Invoice } from '../shared/models';
import { daysFromToday } from '../shared/dates';

const DESCRIPTION_MAX_LENGTH = 200;
const MAX_AMOUNT = 1_000_000;
const PAYMENT_TERM_IN_DAYS = 30;

interface Feedback {
  kind: 'success' | 'error';
  text: string;
}

@Component({
  selector: 'app-billing-page',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './billing-page.html'
})
export class BillingPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly formBuilder = inject(NonNullableFormBuilder);

  protected readonly clients = signal<ClientSummary[]>([]);
  protected readonly invoices = signal<Invoice[]>([]);
  protected readonly creating = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);
  protected readonly today = daysFromToday(0);
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  protected readonly form = this.formBuilder.group({
    clientId: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(DESCRIPTION_MAX_LENGTH)]],
    amount: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(MAX_AMOUNT)
    ]),
    dueDate: [daysFromToday(PAYMENT_TERM_IN_DAYS), Validators.required]
  });

  ngOnInit(): void {
    this.api.listClients().subscribe((clients) => this.clients.set(clients));
    this.api.listInvoices().subscribe((invoices) => this.invoices.set(invoices));
  }

  protected create(): void {
    if (this.form.invalid) return;

    const { clientId, description, amount, dueDate } = this.form.getRawValue();
    this.creating.set(true);
    this.feedback.set(null);
    this.api
      .createInvoice({ clientId, description, amountInCents: Math.round(amount! * 100), dueDate })
      .subscribe({
        next: (invoice) => {
          this.invoices.update((invoices) => [invoice, ...invoices]);
          this.feedback.set({
            kind: 'success',
            text: `Invoice ${invoice.number} created for ${invoice.client.name} (${invoice.client.company}).`
          });
          this.form.reset();
          this.creating.set(false);
        },
        error: () => {
          this.feedback.set({ kind: 'error', text: 'The invoice could not be created. Check the form and try again.' });
          this.creating.set(false);
        }
      });
  }
}
