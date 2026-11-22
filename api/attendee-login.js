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
    const client = createClient({ auth: { url: VITE_NEON_AUTH_URL }, dataApi: { url: VITE_NEON_DATA_API_URL } });
    let { data, error } = await client.auth.signInWithPassword({ email: authEmail, password });
    if (error) {
      const signup = await client.auth.signUp({
        email: authEmail,
        password,
        options: {
          emailRedirectTo: 'https://techfest-fun.vercel.app/',
          data: { name: rows[0].full_name }
        }
      });
      data = signup.data;
      error = signup.error;
      if (!error && !data?.session) {
        const retry = await client.auth.signInWithPassword({ email: authEmail, password });
        data = retry.data;
        error = retry.error;
      }
    }
    if (error || !data?.session?.access_token || !data?.session?.refresh_token) {
      console.error('Passwordless attendee auth failed', error);
      response.status(503).json({ error: 'Could not start your Quest session. Please try again.' });
      return;
    }

    await sql`
      INSERT INTO public.quest_guest_accounts (user_id, registration_email)
      VALUES (${data.user.id}::uuid, ${email})
      ON CONFLICT (user_id) DO NOTHING
    `;
    response.status(200).json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        token_type: data.session.token_type,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        user: data.user
      },
      registration: rows[0]
    });
  } catch (error) {
    console.error('Passwordless attendee login failed', error);
    response.status(503).json({ error: 'Could not start your Quest session. Please try again.' });
  }
}
