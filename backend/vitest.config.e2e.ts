import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Test keys (backend/.env is only read by main.ts). The Notifizz client is replaced by a fake in the tests.
    env: {
      NOTIFIZZ_AUTH_SECRET_KEY: 'test-auth-secret',
      NOTIFIZZ_SDK_SECRET_KEY: 'test-sdk-secret',
      NOTIFIZZ_FRONT_API_KEY: 'test-front-key',
    },
  },
});
