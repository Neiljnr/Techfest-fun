import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'same-origin');
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const identifier = String(request.body?.identifier || '').trim();
  if (!identifier || identifier.length > 254) {
    response.status(400).json({ error: 'Enter the name or email used for your TechFest registration.' });
    return;
  }
  if (!process.env.QUEST_DATABASE_URL) {
    response.status(503).json({ error: 'Quest registration lookup is not configured.' });
    return;
  }

  try {
    const sql = neon(process.env.QUEST_DATABASE_URL);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const rows = isEmail ? await sql`
      SELECT full_name, email, attendee_type, organization, registration_type
      FROM public.quest_registration_lookup
      WHERE email = ${identifier.toLowerCase()}
      LIMIT 1
    ` : await sql`
      SELECT full_name, email, attendee_type, organization, registration_type
      FROM public.quest_registration_lookup
      WHERE lower(trim(full_name)) = lower(trim(${identifier}))
      ORDER BY full_name, email
      LIMIT 6
    `;
    if (rows.length === 0) {
      response.status(200).json({ found: false });
      return;
    }
    if (rows.length > 1) {
      response.status(200).json({ found: false, matches: rows });
      return;
    }
    response.status(200).json({ found: true, ...rows[0] });
  } catch (error) {
    console.error('Quest registration lookup failed', error);
    response.status(503).json({ error: 'Registration lookup is temporarily unavailable. Please try again.' });
  }
}
