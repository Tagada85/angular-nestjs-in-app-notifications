# Acme Invoicing: an Angular + NestJS demo app

A billing team creates invoices for its clients. Each client has their own space with their invoices.

## Run it

Requires Node 22 or 24.

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

Fill `backend/.env` with the two secret keys of one non-production Notifizz environment (dashboard: the SDK setup
page). The backend refuses to start while a key is missing. They never leave the server.

The API listens on http://localhost:3000/api.

```bash
cd frontend
npm install
cp src/environments/environment.development.example.ts src/environments/environment.development.ts
npm start
```

Paste the front API key of the same Notifizz environment in `environment.development.ts` (not committed). It is
public: the browser sends it with every request of the Notifizz bell.

The app runs on http://localhost:4200. The Angular dev server forwards `/api` to the backend
(`frontend/proxy.conf.json`), so the backend needs no CORS setup.

## Try it

1. Open http://localhost:4200/billing in one tab and http://localhost:4200/clients/alice in another.
2. In the billing tab, create an invoice for Alice Martin.
3. Reload Alice's tab: the invoice is there. Bob's space (http://localhost:4200/clients/bob) stays empty.

## API

| Method | Path                         | Body                                              | Returns                                   |
|--------|------------------------------|---------------------------------------------------|-------------------------------------------|
| GET    | `/api/clients`               |                                                   | The clients, without their emails         |
| POST   | `/api/session`               | `{ clientId }`                                    | `{ client, notifizzToken }`, 404 if unknown. The token, signed over the client id, opens that client's Notifizz bell |
| GET    | `/api/invoices`              |                                                   | All invoices, newest first                |
| GET    | `/api/invoices?clientId=bob` |                                                   | One client's invoices, 404 if unknown     |
| GET    | `/api/invoices/next-number`  |                                                   | `{ number }`: the number the form proposes |
| POST   | `/api/invoices`              | `{ number, clientId, description, amountInCents, currency, dueDate }` | The invoice, 400 if the request is invalid, 409 if the number is taken |

Creating an invoice sends the `invoice.created` event to Notifizz, for the invoice's client (`userId`, `email`).
The invoice is created even when Notifizz cannot be reached; the failure is logged.

The billing form proposes the next number (`INV-2026-0003`, after the highest one of the year), and the billing
team can change it: 1 to 32 letters, digits, dashes or slashes, unique whatever its case. The currency is `EUR`,
`USD` or `GBP`. Amounts travel in cents, as integers. `dueDate` is a calendar date, `YYYY-MM-DD`.

Tests: `cd backend && npm run test:e2e`.

## Demo shortcuts

- The clients are hard-coded in `backend/src/clients/clients.service.ts`, and the invoices live in memory: they
  disappear when the backend restarts.
- There is no login: the client space comes from the URL, and anyone can read any client's invoices. A real app
  takes the client from its own authentication.
