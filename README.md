# TechFest Quest

TechFest Quest is a React/Vite event application backed by Neon Auth and Neon Postgres (via the Neon Data API). Accounts use email and password; attendees can start immediately, and organizer access requires a verified email (verify once with the emailed sign-in code). attendee profiles, connections, event check-ins, quiz results, and scores are shared server-side. Point awards and quiz scoring are performed by database functions, not trusted to the browser.

## Local setup

1. Create a Neon project and enable **Auth** and the **Data API** (public schema, `neon_auth` provider). Configure a production SMTP sender in Neon Auth before opening registration; the shared sender is for development only.
2. Apply [`neon/migrations/202611050001_event_backend.sql`](./neon/migrations/202611050001_event_backend.sql) to the database.
3. Copy `.env.example` to `.env.local` and set:
   - `VITE_NEON_AUTH_URL`: the Neon Auth URL.
   - `VITE_NEON_DATA_API_URL`: the Neon Data API URL.
4. Add the production URL as a trusted origin in Neon Auth (localhost is allowed for development).
5. Run `npm install`, then `npm run dev`.

The browser configuration must contain only these two public URLs. Never put a database connection string or API key in Vite environment variables or Vercel client-side settings.

## Organizer access

The first organizer must add authorized addresses with SQL using the project owner role:

```sql
insert into public.staff_allowlist (email)
values (lower('organizer@example.com'))
on conflict (email) do nothing;
```

Only verified users whose email is on this server-side allowlist receive the organizer console. The app does not expose a client-side way to grant staff access.

Organizers create partner, session, roundtable, and signal-drop QRs from the console. Codes are random, expire after the configured duration, and can be claimed only once per attendee. Display a fresh QR at the relevant physical location; a static QR can still be shared while it is active.

## Vercel deployment

Import the repository into Vercel with the default Vite build settings (`npm run build`, output directory `dist`). Add `VITE_NEON_AUTH_URL` and `VITE_NEON_DATA_API_URL` as Vercel environment variables for each deployment environment. `vercel.json` rewrites SPA routes to `index.html`. Add each deployed URL as a trusted origin in Neon Auth.

## Important behavior and limits

- Social follow and post quests are attendee self-reports; submitted URLs are not automatically verified by the app.
- Event check-ins require active organizer-issued QR codes. The database enforces expiration, claim limits, and one award per attendee/event, but an active QR can be photographed or shared.
- Email verification and organizer authorization require Neon Auth and the migration to be configured; the app displays a setup-required state rather than falling back to browser-only demo accounts.
- Account deletion removes the authenticated account and its dependent profile, connections, state, and score ledger.
- Before inviting attendees, verify the event dates, social destinations, partner details, booth locations, and challenge answers in `src/data/quests.js`, `src/data/partners.js`, and the migration's private answer-key seed. These are event-specific content and must match the actual event.

## Validation

Run `npm run build` to validate the production bundle. The migration must be tested end to end against a Neon project, and the event-specific content above must be confirmed before the application can accept real accounts or event traffic.
