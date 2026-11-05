import { createClient } from '@neon/neon-js/supabase';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL?.trim();
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL?.trim();

export const isNeonConfigured = Boolean(authUrl && dataApiUrl);
export const neon = isNeonConfigured
  ? createClient({ auth: { url: authUrl }, dataApi: { url: dataApiUrl } })
  : null;
