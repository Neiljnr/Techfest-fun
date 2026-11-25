import { createClient as createDataClient } from '@neon/neon-js';
import { createClient as createAuthClient } from '@neon/neon-js/supabase';

// Safari versions commonly found on older iPhones do not implement the
// static Response.json() helper used by the Neon Auth client when serving a
// cached session. Keep the SDK's cache path compatible with those browsers.
if (typeof Response !== 'undefined' && typeof Response.json !== 'function') {
  Object.defineProperty(Response, 'json', {
    configurable: true,
    writable: true,
    value(body, init = {}) {
      const headers = new Headers(init.headers);
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
      return new Response(JSON.stringify(body), { ...init, headers });
    }
  });
}

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim();
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL?.trim();

// Use the app's own origin for browser auth requests. This keeps Neon Auth's
// session cookies first-party in Safari, including on older iPhones where
// cross-site cookie behavior is less predictable.
const browserAuthUrl = import.meta.env.PROD && typeof window !== 'undefined'
  ? `${window.location.origin}/api/neon-auth`
  : authUrl;

export const isNeonConfigured = Boolean(authUrl && dataApiUrl);
let cachedDataToken = null;
let dataTokenExpiresAt = 0;
let tokenRequest = null;

const getDataApiToken = async () => {
  if (cachedDataToken && Date.now() < dataTokenExpiresAt) return cachedDataToken;
  if (!tokenRequest) {
    tokenRequest = (async () => {
      const response = await fetch(`${browserAuthUrl.replace(/\/+$/, '')}/token`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) return null;
        throw new Error(`Could not retrieve a database session token (${response.status}).`);
      }
      const result = await response.json();
      const token = result?.token;
      if (typeof token !== 'string' || token.split('.').length !== 3) {
        throw new Error('The database session did not return a valid JWT. Sign in again.');
      }
      cachedDataToken = token;
      dataTokenExpiresAt = Date.now() + 30_000;
      return token;
    })().finally(() => {
      tokenRequest = null;
    });
  }
  return tokenRequest;
};

const authClient = isNeonConfigured
  ? createAuthClient({ auth: { url: browserAuthUrl }, dataApi: { url: dataApiUrl } })
  : null;

if (authClient) {
  authClient.auth.onAuthStateChange(() => {
    cachedDataToken = null;
    dataTokenExpiresAt = 0;
  });
}

const dataClient = isNeonConfigured
  ? createDataClient({ dataApi: { url: dataApiUrl, getToken: getDataApiToken } })
  : null;

export const neon = dataClient && authClient
  ? Object.assign(dataClient, { auth: authClient.auth })
  : null;
