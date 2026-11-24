import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NotifizzClient } from '@notifizz/nodejs';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

interface SentEvent {
  name: string;
  properties: Record<string, unknown>;
  options: { idempotencyKey?: string };
}

// Stands in for the Notifizz SDK: no network call. The token shows which value was signed,
// and the events the app sends are recorded. `notifizzIsDown` makes every track() fail.
let sentEvents: SentEvent[] = [];
let notifizzIsDown = false;
const fakeNotifizz = {
  generateHashedToken: (userId: string) => `signed:${userId}`,
  track: async (name: string, properties: Record<string, unknown>, options: { idempotencyKey?: string }) => {
    if (notifizzIsDown) throw new Error('Notifizz unreachable');
    sentEvents.push({ name, properties, options });
  },
};

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    sentEvents = [];
    notifizzIsDown = false;
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(NotifizzClient)
      .useValue(fakeNotifizz)
      .compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());
  const year = new Date().getUTCFullYear();
  const validInvoice = {
    clientId: 'alice',
    description: 'Website redesign, phase 1',
    amountInCents: 125000,
    currency: 'EUR',
    dueDate: '2026-12-31',
  };
  // Each invoice gets its own number unless the test sets one: numbers must be unique.
  // An override set to `undefined` drops the field from the request.
  let createdCount = 0;
  const createInvoice = (overrides: object = {}) => {
    createdCount += 1;
    return api()
      .post('/api/invoices')
      .send({ ...validInvoice, number: `TEST-${createdCount}`, ...overrides });
  };
  const suggestedNumber = async () => (await api().get('/api/invoices/next-number').expect(200)).body.number;

  it('lists the clients without their emails', () => {
    return api()
      .get('/api/clients')
      .expect(200)
      .expect([
        { id: 'alice', name: 'Alice Martin', company: 'Globex' },
        { id: 'bob', name: 'Bob Durand', company: 'Initech' },
      ]);
  });

  // The bell opens the inbox of the id its token was signed over: signing another value
  // (the email, another client) would show an empty bell, or someone else's notifications.
  it("opens a known client's session, with the bell options and a token signed over their id", () => {
    return api()
      .post('/api/session')
      .send({ clientId: 'bob' })
      .expect(200)
      .expect({
        client: { id: 'bob', name: 'Bob Durand', company: 'Initech', email: 'bob@example.com' },
        bell: {
          apiKey: 'test-front-key',
          authType: 'backendToken',
          userId: 'bob',
          userEmail: 'bob@example.com',
          token: 'signed:bob',
        },
      });
  });

  // The client's bell shows the notification only if the event names that client: the userId must
  // be the id the bell token is signed over. The key makes a retried emit notify only once.
  it('tells Notifizz an invoice was created, for its client, once per invoice', async () => {
    const response = await createInvoice({ clientId: 'alice', number: 'INV-2026-0042', currency: 'USD' }).expect(201);

    expect(sentEvents).toEqual([
      {
        name: 'invoice.created',
        properties: {
          userId: 'alice',
          email: 'alice@example.com',
          clientName: 'Alice Martin',
          company: 'Globex',
          invoiceId: response.body.id,
          invoiceNumber: 'INV-2026-0042',
          description: 'Website redesign, phase 1',
          amountInCents: 125000,
          currency: 'USD',
          dueDate: '2026-12-31',
        },
        options: { idempotencyKey: `invoice-created:${response.body.id}` },
      },
    ]);
  });

  // Billing must not depend on Notifizz: an outage there cannot cost an invoice.
  it('still creates the invoice when Notifizz is down', async () => {
    notifizzIsDown = true;

    await createInvoice({ number: 'INV-2026-0050' }).expect(201);

    const response = await api().get('/api/invoices').expect(200);
    expect(response.body.map((invoice: { number: string }) => invoice.number)).toEqual(['INV-2026-0050']);
  });

  it('tells Notifizz nothing about a refused invoice', async () => {
    await createInvoice({ number: 'INV-2026-0001' }).expect(201);
    sentEvents = [];

    await createInvoice({ number: 'INV-2026-0001' }).expect(409);
    await createInvoice({ clientId: 'mallory' }).expect(400);

    expect(sentEvents).toEqual([]);
  });

  it('refuses a session for an unknown client', () => {
    return api().post('/api/session').send({ clientId: 'mallory' }).expect(404);
  });

  it('creates an invoice with the number and currency it was given, and the client from the server list', async () => {
    const response = await createInvoice({
      number: ' INV-2026-0042 ',
      currency: 'USD',
      description: '  Website redesign, phase 1  ',
    }).expect(201);

    expect(response.body).toMatchObject({
      number: 'INV-2026-0042',
      client: { id: 'alice', name: 'Alice Martin', company: 'Globex' },
      description: 'Website redesign, phase 1',
      amountInCents: 125000,
      currency: 'USD',
      dueDate: '2026-12-31',
    });
  });

  it('suggests the first number of the year when no invoice exists', async () => {
    expect(await suggestedNumber()).toBe(`INV-${year}-0001`);
  });

  // An invoice created with a lower number after a higher one, a number typed in lowercase,
  // a previous year's number and a number in another format: only the highest of this year counts.
  it("suggests the number after this year's highest one", async () => {
    await createInvoice({ number: `inv-${year}-0007` }).expect(201);
    await createInvoice({ number: `INV-${year}-0001` }).expect(201);
    await createInvoice({ number: `INV-${year - 1}-0099` }).expect(201);
    await createInvoice({ number: 'ACME-0100' }).expect(201);

    expect(await suggestedNumber()).toBe(`INV-${year}-0008`);
  });

  it('refuses a number already used, whatever its case', async () => {
    await createInvoice({ number: `INV-${year}-0001` }).expect(201);

    await createInvoice({ number: `inv-${year}-0001` }).expect(409);
  });

  it('refuses an invoice without a number', () => {
    return createInvoice({ number: undefined }).expect(400);
  });

  it('refuses a number with characters other than letters, digits, dashes and slashes', () => {
    return createInvoice({ number: 'INV 2026 0001' }).expect(400);
  });

  it('refuses a number longer than 32 characters', () => {
    return createInvoice({ number: 'A'.repeat(33) }).expect(400);
  });

  it('refuses a currency other than EUR, USD and GBP', () => {
    return createInvoice({ currency: 'JPY' }).expect(400);
  });

  it('refuses an invoice without a currency', () => {
    return createInvoice({ currency: undefined }).expect(400);
  });

  it("shows a client only their own invoices", async () => {
    await createInvoice({ clientId: 'alice', description: 'For Alice' }).expect(201);
    await createInvoice({ clientId: 'bob', description: 'For Bob' }).expect(201);

    const response = await api().get('/api/invoices').query({ clientId: 'bob' }).expect(200);

    expect(response.body.map((invoice: { description: string }) => invoice.description)).toEqual(['For Bob']);
  });

  it('lists all invoices, newest first, for the billing team', async () => {
    await createInvoice({ description: 'First' }).expect(201);
    await createInvoice({ description: 'Second' }).expect(201);

    const response = await api().get('/api/invoices').expect(200);

    expect(response.body.map((invoice: { description: string }) => invoice.description)).toEqual(['Second', 'First']);
  });

  it("refuses to list an unknown client's invoices", () => {
    return api().get('/api/invoices').query({ clientId: 'mallory' }).expect(404);
  });

  it('refuses an invoice for an unknown client', () => {
    return createInvoice({ clientId: 'mallory' }).expect(400);
  });

  it('refuses a blank description', () => {
    return createInvoice({ description: '   ' }).expect(400);
  });

  it('refuses an amount that is not a whole number of cents', () => {
    return createInvoice({ amountInCents: 1250.5 }).expect(400);
  });

  it('refuses a zero amount', () => {
    return createInvoice({ amountInCents: 0 }).expect(400);
  });

  it('refuses a due date that does not exist', () => {
    return createInvoice({ dueDate: '2026-02-30' }).expect(400);
  });

  it('refuses a due date with a time', () => {
    return createInvoice({ dueDate: '2026-12-31T10:00:00Z' }).expect(400);
  });

  it('refuses fields the API does not know, such as an issue date set by the client', () => {
    return createInvoice({ issuedAt: '1999-01-01T00:00:00.000Z' }).expect(400);
  });
});
