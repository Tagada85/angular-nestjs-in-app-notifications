import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const api = () => request(app.getHttpServer());
  const validInvoice = {
    clientId: 'alice',
    description: 'Website redesign, phase 1',
    amountInCents: 125000,
    dueDate: '2026-12-31',
  };
  const createInvoice = (overrides: object = {}) => api().post('/api/invoices').send({ ...validInvoice, ...overrides });

  it('lists the clients without their emails', () => {
    return api()
      .get('/api/clients')
      .expect(200)
      .expect([
        { id: 'alice', name: 'Alice Martin', company: 'Globex' },
        { id: 'bob', name: 'Bob Durand', company: 'Initech' },
      ]);
  });

  it("opens a known client's session", () => {
    return api()
      .post('/api/session')
      .send({ clientId: 'bob' })
      .expect(200)
      .expect({ id: 'bob', name: 'Bob Durand', company: 'Initech', email: 'bob@example.com' });
  });

  it('refuses a session for an unknown client', () => {
    return api().post('/api/session').send({ clientId: 'mallory' }).expect(404);
  });

  it('creates an invoice with a number and the client from the server list', async () => {
    const response = await createInvoice({ description: '  Website redesign, phase 1  ' }).expect(201);

    expect(response.body).toMatchObject({
      number: `INV-${new Date().getUTCFullYear()}-0001`,
      client: { id: 'alice', name: 'Alice Martin', company: 'Globex' },
      description: 'Website redesign, phase 1',
      amountInCents: 125000,
      currency: 'EUR',
      dueDate: '2026-12-31',
    });
  });

  it('numbers invoices in sequence', async () => {
    await createInvoice().expect(201);
    const second = await createInvoice({ clientId: 'bob' }).expect(201);

    expect(second.body.number).toBe(`INV-${new Date().getUTCFullYear()}-0002`);
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

  it('refuses fields the API does not know', () => {
    return createInvoice({ number: 'INV-1999-9999' }).expect(400);
  });
});
