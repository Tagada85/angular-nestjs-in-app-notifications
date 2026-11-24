import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NotifizzAngularComponent, type NotifizzOptions } from '@notifizz/angular';
import { environment } from '../../environments/environment';
import { ApiService } from '../shared/api.service';
import { Invoice, Session } from '../shared/models';

@Component({
  selector: 'app-client-space-page',
  imports: [CurrencyPipe, DatePipe, NotifizzAngularComponent],
  templateUrl: './client-space-page.html'
})
export class ClientSpacePage implements OnInit {
  /** From the route: /clients/:clientId */
  readonly clientId = input.required<string>();

  private readonly api = inject(ApiService);

  protected readonly session = signal<Session | null>(null);
  protected readonly client = computed(() => this.session()?.client ?? null);
  protected readonly invoices = signal<Invoice[]>([]);
  protected readonly notFound = signal(false);

  /** The Notifizz bell of the current client: their id and email, and the token the backend signed over that id. */
  protected readonly bellOptions = computed<NotifizzOptions | null>(() => {
    const session = this.session();
    if (!session) return null;
    return {
      apiKey: environment.notifizzFrontApiKey,
      authType: 'backendToken',
      userId: session.client.id,
      userEmail: session.client.email,
      token: session.notifizzToken,
      notificationCenterStyles: { marginTop: '20px' }
    };
  });

  ngOnInit(): void {
    this.api.openSession(this.clientId()).subscribe({
      next: (session) => {
        this.session.set(session);
        this.api.listInvoices(session.client.id).subscribe((invoices) => this.invoices.set(invoices));
      },
      error: () => this.notFound.set(true)
    });
  }
}
