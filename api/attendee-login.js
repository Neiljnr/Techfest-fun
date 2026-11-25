import { createHmac } from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { createClient } from '@neon/neon-js/supabase';

const digest = (secret, purpose, value) => createHmac('sha256', secret).update(`${purpose}:${value}`).digest('hex');

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const email = String(request.body?.email || '').trim().toLowerCase();
  const name = String(request.body?.name || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || name.length > 160) {
    response.status(400).json({ error: 'Confirm a valid registration before continuing.' });
    return;
  }
  const { QUEST_DATABASE_URL, QUEST_GUEST_AUTH_SECRET, VITE_NEON_AUTH_URL, VITE_NEON_DATA_API_URL } = process.env;
  if (!QUEST_DATABASE_URL || !QUEST_GUEST_AUTH_SECRET || !VITE_NEON_AUTH_URL || !VITE_NEON_DATA_API_URL) {
    response.status(503).json({ error: 'Passwordless sign-in is not configured.' });
    return;
  }

  try {
    const forwardedHost = request.headers['x-forwarded-host'] || request.headers.host || 'localhost';
    const host = String(forwardedHost).split(',')[0].trim();
    const forwardedProtocol = request.headers['x-forwarded-proto'] || (host.startsWith('localhost') ? 'http' : 'https');
    const protocol = String(forwardedProtocol).split(',')[0].trim();
    const appOrigin = new URL(`${protocol}://${host}`).origin;
    const sql = neon(QUEST_DATABASE_URL);
    const rows = await sql`
      SELECT email, full_name, attendee_type, organization, registration_type
      FROM public.quest_registration_lookup
      WHERE email = ${email} AND lower(trim(full_name)) = lower(trim(${name}))
      LIMIT 1
    `;
    if (!rows.length) {
      response.status(404).json({ error: 'The registration details no longer match. Search again.' });
      return;
    }

    // Credentials are stable across devices and are only ever used by this server.
    const identity = digest(QUEST_GUEST_AUTH_SECRET, 'identity', email);
    const authEmail = `guest-${identity.slice(0, 36)}@quest.invalid`;
    const password = digest(QUEST_GUEST_AUTH_SECRET, 'credential', email);
    const client = createClient({
      auth: {
        url: VITE_NEON_AUTH_URL,
        fetchOptions: { headers: { Origin: appOrigin } }
      },
      dataApi: { url: VITE_NEON_DATA_API_URL }
    });
    let { error: authError } = await client.auth.signInWithPassword({ email: authEmail, password });
    if (authError && authError.code !== 'session_not_found') {
      const signup = await client.auth.signUp({
        email: authEmail,
        password,
        options: {
          emailRedirectTo: `${appOrigin}/`,
          data: { name: rows[0].full_name }
        }
      });
      authError = signup.error;
    }
    // In a serverless function the Better Auth cookie cannot be retained by this
    // adapter. `session_not_found` means the credentials were accepted, but the
    // browser must perform the actual sign-in to persist its own session.
    if (authError && authError.code !== 'session_not_found') {
      console.error('Passwordless attendee auth failed', authError);
      response.status(503).json({ error: 'Could not start your Quest session. Please try again.' });
      return;
    }

    const [authUser] = await sql`
      SELECT id FROM neon_auth."user" WHERE email = ${authEmail} LIMIT 1
    `;
    if (!authUser) throw new Error('Quest auth identity was not created.');

    await sql`
      INSERT INTO public.quest_guest_accounts (user_id, registration_email)
      VALUES (${authUser.id}::uuid, ${email})
      ON CONFLICT (user_id) DO NOTHING
    `;
    response.status(200).json({
      credentials: { email: authEmail, password },
      registration: rows[0]
    });
  } catch (error) {
    console.error('Passwordless attendee login failed', error);
    response.status(503).json({ error: 'Could not start your Quest session. Please try again.' });
  }
}
