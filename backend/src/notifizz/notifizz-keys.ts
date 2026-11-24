/**
 * The Notifizz secret keys, read from backend/.env (see .env.example). Both come from the same
 * Notifizz environment and never leave this server.
 */
export function notifizzKeys() {
  return {
    authSecretKey: required('NOTIFIZZ_AUTH_SECRET_KEY'),
    sdkSecretKey: required('NOTIFIZZ_SDK_SECRET_KEY'),
  };
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in backend/.env (copy backend/.env.example)`);
  return value;
}
