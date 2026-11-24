import { notifizzKeys } from '../src/notifizz/notifizz-keys.js';

// The test keys come from vitest.config.e2e.ts; each test removes or blanks one of them.
describe('Notifizz keys', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it('reads the three keys', () => {
    expect(notifizzKeys()).toEqual({
      authSecretKey: 'test-auth-secret',
      sdkSecretKey: 'test-sdk-secret',
      frontApiKey: 'test-front-key',
    });
  });

  // A key left empty in .env must stop the startup, and say which key: otherwise the bell stays empty without a word.
  it('refuses a blank key, and names it', () => {
    process.env.NOTIFIZZ_AUTH_SECRET_KEY = '   ';
    expect(() => notifizzKeys()).toThrow('Missing NOTIFIZZ_AUTH_SECRET_KEY in backend/.env');
  });

  it('refuses a missing key, and names it', () => {
    delete process.env.NOTIFIZZ_FRONT_API_KEY;
    expect(() => notifizzKeys()).toThrow('Missing NOTIFIZZ_FRONT_API_KEY in backend/.env');
  });
});
