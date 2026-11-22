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

  const sendKudos = (body: object) => request(app.getHttpServer()).post('/api/kudos').send(body);

  it('lists the users without their emails', () => {
    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect([
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' },
      ]);
  });

  it('opens a session for a known user', () => {
    return request(app.getHttpServer())
      .post('/api/session')
      .send({ userId: 'bob' })
      .expect(200)
      .expect({ id: 'bob', name: 'Bob', email: 'bob@example.com' });
  });

  it('refuses a session for an unknown user', () => {
    return request(app.getHttpServer()).post('/api/session').send({ userId: 'mallory' }).expect(404);
  });

  it('sends kudos with the names from the server list', async () => {
    const response = await sendKudos({ fromUserId: 'alice', toUserId: 'bob', message: '  Great demo!  ' }).expect(201);

    expect(response.body).toMatchObject({
      from: { id: 'alice', name: 'Alice' },
      to: { id: 'bob', name: 'Bob' },
      message: 'Great demo!',
    });
  });

  it('refuses kudos to yourself', () => {
    return sendKudos({ fromUserId: 'alice', toUserId: 'alice', message: 'Me again' }).expect(400);
  });

  it('refuses kudos to an unknown user', () => {
    return sendKudos({ fromUserId: 'alice', toUserId: 'mallory', message: 'Hi' }).expect(400);
  });

  it('refuses a blank message', () => {
    return sendKudos({ fromUserId: 'alice', toUserId: 'bob', message: '   ' }).expect(400);
  });

  it('refuses a message longer than 280 characters', () => {
    return sendKudos({ fromUserId: 'alice', toUserId: 'bob', message: 'a'.repeat(281) }).expect(400);
  });

  it('refuses fields the API does not know', () => {
    return sendKudos({ fromUserId: 'alice', toUserId: 'bob', message: 'Hi', fromName: 'Admin' }).expect(400);
  });
});
