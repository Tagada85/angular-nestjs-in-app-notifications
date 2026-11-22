import { Routes } from '@angular/router';
import { BillingPage } from './billing-page/billing-page';
import { ClientSpacePage } from './client-space-page/client-space-page';
import { HomePage } from './home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Acme Invoicing' },
  { path: 'billing', component: BillingPage, title: 'Billing · Acme Invoicing' },
  { path: 'clients/:clientId', component: ClientSpacePage, title: 'Client space · Acme Invoicing' },
  { path: '**', redirectTo: '' }
];
