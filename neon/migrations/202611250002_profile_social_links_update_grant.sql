begin;

-- Attendees may edit only their own profile row (enforced by the existing RLS policy).
-- Add the new social-links column to the existing column-scoped update grant.
grant update (social_links) on public.profiles to authenticated;

commit;
