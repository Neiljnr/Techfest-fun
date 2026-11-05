# TechFest Quest

TechFest Quest is a React/Vite event application backed by Supabase Auth and Postgres. Accounts require email verification; attendee profiles, connections, event check-ins, quiz results, and scores are shared server-side. Point awards and quiz scoring are performed by database functions, not trusted to the browser.

## Local setup

1. Create a Supabase project and enable the Email provider in **Authentication → Providers**. Configure email OTP delivery with production SMTP before opening registration to attendees.
2. Apply [`supabase/migrations/202611050001_event_backend.sql`](./supabase/migrations/202611050001_event_backend.sql) in the Supabase SQL Editor.
3. Copy `.env.example` to `.env.local` and set:
   - `VITE_SUPABASE_URL`: the project URL.
   - `VITE_SUPABASE_ANON_KEY`: the project's publishable/anon key.
4. In **Authentication → URL Configuration**, set the production Site URL and add the production URL and local development URL to the redirect allowlist.
5. Run `npm install`, then `npm run dev`.

The browser configuration must contain only the Supabase URL and publishable/anon key. Never put a service-role key in Vite environment variables or Vercel client-side settings.

## Organizer access

The first organizer must add authorized addresses through the Supabase SQL Editor using a trusted project-owner account:

```sql
insert into public.staff_allowlist (email)
values (lower('organizer@example.com'))
on conflict (email) do nothing;
```

Only verified Supabase users whose email is on this server-side allowlist receive the organizer console. The app does not expose a client-side way to grant staff access.

Organizers create partner, session, roundtable, and signal-drop QRs from the console. Codes are random, expire after the configured duration, and can be claimed only once per attendee. Display a fresh QR at the relevant physical location; a static QR can still be shared while it is active.

## Vercel deployment

Import the repository into Vercel with the default Vite build settings (`npm run build`, output directory `dist`). Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables for each deployment environment. `vercel.json` rewrites SPA routes to `index.html`. Add each deployed URL to the Supabase Auth redirect allowlist.

## Important behavior and limits

- Social follow and post quests are attendee self-reports; submitted URLs are not automatically verified by the app.
- Event check-ins require active organizer-issued QR codes. The database enforces expiration, claim limits, and one award per attendee/event, but an active QR can be photographed or shared.
- Email verification and organizer authorization require Supabase Auth and the migration to be configured; the app displays a setup-required state rather than falling back to browser-only demo accounts.
- Account deletion removes the authenticated account and its dependent profile, connections, state, and score ledger.
- Before inviting attendees, verify the event dates, social destinations, partner details, booth locations, and challenge answers in `src/data/quests.js`, `src/data/partners.js`, and the migration's private answer-key seed. These are event-specific content and must match the actual event.

## Validation

Run `npm run build` to validate the production bundle. The SQL migration must be applied to a Supabase project and tested there, and the event-specific content above must be confirmed before the application can accept real accounts or event traffic.
