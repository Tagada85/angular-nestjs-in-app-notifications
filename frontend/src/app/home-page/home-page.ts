import { Component, OnInit, inject, signal } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { ClientSummary } from '../shared/models';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html'
})
export class HomePage implements OnInit {
  private readonly api = inject(ApiService);

  protected readonly clients = signal<ClientSummary[]>([]);

  ngOnInit(): void {
    this.api.listClients().subscribe((clients) => this.clients.set(clients));
  }
}
