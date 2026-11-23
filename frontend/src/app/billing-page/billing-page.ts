import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { ClientSummary, INVOICE_CURRENCIES, Invoice, InvoiceCurrency } from '../shared/models';
import { daysFromToday } from '../shared/dates';

/** Same rule as the backend: 1 to 32 letters, digits, dashes or slashes. */
const INVOICE_NUMBER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9/-]{0,31}$/;
const INVOICE_NUMBER_MAX_LENGTH = 32;
const DESCRIPTION_MAX_LENGTH = 200;
const MAX_AMOUNT = 1_000_000;
const PAYMENT_TERM_IN_DAYS = 30;
const DEFAULT_CURRENCY: InvoiceCurrency = 'EUR';

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
  protected readonly currencies = INVOICE_CURRENCIES;
  protected readonly numberMaxLength = INVOICE_NUMBER_MAX_LENGTH;
  protected readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  protected readonly form = this.formBuilder.group({
    number: ['', [Validators.required, Validators.pattern(INVOICE_NUMBER_PATTERN)]],
    clientId: ['', Validators.required],
    description: ['', [Validators.required, Validators.maxLength(DESCRIPTION_MAX_LENGTH)]],
    amount: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(MAX_AMOUNT)
    ]),
    currency: this.formBuilder.control<InvoiceCurrency>(DEFAULT_CURRENCY, Validators.required),
    dueDate: [daysFromToday(PAYMENT_TERM_IN_DAYS), Validators.required]
  });

  ngOnInit(): void {
    this.api.listClients().subscribe((clients) => this.clients.set(clients));
    this.api.listInvoices().subscribe((invoices) => this.invoices.set(invoices));
    this.proposeNextNumber();
  }

  protected create(): void {
    if (this.form.invalid) return;

    const { number, clientId, description, amount, currency, dueDate } = this.form.getRawValue();
    this.creating.set(true);
    this.feedback.set(null);
    this.api
      .createInvoice({ number, clientId, description, amountInCents: Math.round(amount! * 100), currency, dueDate })
      .subscribe({
        next: (invoice) => {
          this.invoices.update((invoices) => [invoice, ...invoices]);
          this.feedback.set({
            kind: 'success',
            text: `Invoice ${invoice.number} created for ${invoice.client.name} (${invoice.client.company}).`
          });
          this.form.reset();
          this.proposeNextNumber();
          this.creating.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.feedback.set({
            kind: 'error',
            text:
              error.status === 409
                ? `Invoice number ${number} is already used. Choose another one.`
                : 'The invoice could not be created. Check the form and try again.'
          });
          this.creating.set(false);
        }
      });
  }

  /** The backend proposes the next number; the billing team can change it before creating the invoice. */
  private proposeNextNumber(): void {
    this.api.suggestNextInvoiceNumber().subscribe((number) => this.form.controls.number.setValue(number));
  }
}
