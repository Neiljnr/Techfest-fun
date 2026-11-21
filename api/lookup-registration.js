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

  const email = String(request.body?.email || '').trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400).json({ error: 'Enter the email address used for your TechFest registration.' });
    return;
  }
  if (!process.env.QUEST_DATABASE_URL) {
    response.status(503).json({ error: 'Quest registration lookup is not configured.' });
    return;
  }

  try {
    const sql = neon(process.env.QUEST_DATABASE_URL);
    const [registration] = await sql`
      SELECT full_name, email, attendee_type, organization, registration_type
      FROM public.quest_registration_lookup
      WHERE email = ${email}
      LIMIT 1
    `;
    if (!registration) {
      response.status(200).json({ found: false });
      return;
    }
    response.status(200).json({ found: true, ...registration });
  } catch (error) {
    console.error('Quest registration lookup failed', error);
    response.status(503).json({ error: 'Registration lookup is temporarily unavailable. Please try again.' });
  }
}
