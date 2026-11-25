import { createClient } from '@neon/neon-js/supabase';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim();
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL?.trim();

// Use the app's own origin for browser auth requests. This keeps Neon Auth's
// session cookies first-party in Safari, including on older iPhones where
// cross-site cookie behavior is less predictable.
const browserAuthUrl = import.meta.env.PROD && typeof window !== 'undefined'
  ? `${window.location.origin}/api/neon-auth`
  : authUrl;

export const isNeonConfigured = Boolean(authUrl && dataApiUrl);
export const neon = isNeonConfigured
  ? createClient({ auth: { url: browserAuthUrl }, dataApi: { url: dataApiUrl } })
  : null;
