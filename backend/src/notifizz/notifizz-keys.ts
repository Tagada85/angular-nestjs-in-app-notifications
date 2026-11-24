/**
 * The Notifizz keys, read from backend/.env (see .env.example). All three come from the same
 * Notifizz environment. The two secrets never leave this server; the front key reaches the browser.
 */
export function notifizzKeys() {
  return {
    authSecretKey: required('NOTIFIZZ_AUTH_SECRET_KEY'),
    sdkSecretKey: required('NOTIFIZZ_SDK_SECRET_KEY'),
    frontApiKey: required('NOTIFIZZ_FRONT_API_KEY'),
  };
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in backend/.env (copy backend/.env.example)`);
  return value;
}
