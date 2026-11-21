-- Migration: 202611210001_registration_lookup
-- Description: Add registration lookup function, update ensure_profile with attendee info,
--              and add registration_email column to profiles.

--------------------------------------------------------------------------------
-- 1. lookup_registration(p_identifier text)
--    Searches techfest_registrations by email (exact, case-insensitive).
--    Names are not unique and must not expose registrant details to strangers.
--    Callable by anon (pre-auth) and authenticated roles.
--------------------------------------------------------------------------------

-- The registration site has its own Neon project. Its server mirrors only the
-- account-setup fields into this private table.
create table if not exists public.quest_registration_lookup (
  email text primary key check (email = lower(email)),
  full_name text not null,
  attendee_type text not null,
  organization text,
  registration_type text not null check (registration_type in ('attendee', 'speaker', 'vendor')),
  synced_at timestamptz not null default now()
);
revoke all on public.quest_registration_lookup from public, anonymous, authenticated;

create or replace function public.lookup_registration(p_identifier text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  identifier_trimmed text;
  reg record;
begin
  identifier_trimmed := lower(trim(p_identifier));

  if identifier_trimmed is null or identifier_trimmed = '' then
    return jsonb_build_object('found', false);
  end if;

  -- Try email match first (exact, case-insensitive)
  select full_name, email, attendee_type, organization, registration_type
    into reg
    from public.quest_registration_lookup
   where email = identifier_trimmed
   limit 1;

  if not found then
    return jsonb_build_object('found', false);
  end if;

  -- Return info needed for account setup (no phone/photo for privacy)
  return jsonb_build_object(
    'found', true,
    'full_name', reg.full_name,
    'email', reg.email,
    'attendee_type', reg.attendee_type,
    'organization', reg.organization,
    'registration_type', reg.registration_type
  );
end;
$$;

-- Grant execute to both anon and authenticated roles
revoke all on function public.lookup_registration(text) from public;
grant execute on function public.lookup_registration(text) to anonymous;
grant execute on function public.lookup_registration(text) to authenticated;

--------------------------------------------------------------------------------
-- 2. Add registration_email column to profiles (nullable, for linking back)
--------------------------------------------------------------------------------

alter table public.profiles
  add column if not exists registration_email text;

--------------------------------------------------------------------------------
-- 3. Update ensure_profile to accept registration info and link the authenticated
--    account to its registration. The registration email must match Auth email.
--------------------------------------------------------------------------------

create or replace function public.ensure_profile(
  p_name text default null,
  p_role text default null,
  p_attendee_type text default null,
  p_organization text default null,
  p_registration_email text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_email text;
  profile_name text;
  profile_role text;
  registration public.quest_registration_lookup;
  result public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;

  select * into result from public.profiles where id = auth.uid();
  if found then
    -- Profile exists; update bio/company if currently empty and new values provided
    if p_attendee_type is not null and (result.bio is null or trim(result.bio) = '') then
      update public.profiles
         set bio = 'Techfest: ' || p_attendee_type
       where id = auth.uid();
    end if;

    if p_organization is not null and (result.company is null or trim(result.company) = '') then
      update public.profiles
         set company = p_organization
       where id = auth.uid();
    end if;

    select * into result from public.profiles where id = auth.uid();
    return result;
  end if;

  select email into account_email from neon_auth."user" where id = auth.uid();
  if not found then raise exception 'Account not found'; end if;

  if p_registration_email is null or lower(trim(p_registration_email)) <> lower(account_email) then
    raise exception 'Use the email address from your TechFest registration';
  end if;

  select * into registration
    from public.quest_registration_lookup
   where email = lower(account_email)
   limit 1;
  if not found then raise exception 'No TechFest registration matches this account email'; end if;

  p_attendee_type := coalesce(p_attendee_type, registration.attendee_type);
  p_organization := coalesce(p_organization, registration.organization);

  profile_name := left(trim(coalesce(nullif(trim(p_name), ''), split_part(account_email, '@', 1))), 60);
  if profile_name = '' then profile_name := 'Attendee'; end if;

  profile_role := coalesce(p_role, 'builder');
  if profile_role not in ('builder', 'founder', 'designer', 'operator', 'student') then
    profile_role := 'builder';
  end if;

  insert into public.profiles (id, name, role, bio, company, registration_email)
  values (
    auth.uid(),
    profile_name,
    profile_role,
    coalesce(case when p_attendee_type is not null then 'Techfest: ' || p_attendee_type end, ''),
    coalesce(p_organization, ''),
    lower(account_email)
  )
  on conflict (id) do nothing;

  insert into public.participant_state (user_id) values (auth.uid()) on conflict (user_id) do nothing;

  insert into public.point_ledger (user_id, event_key, title, points, stage, reason)
  values (auth.uid(), 'profile-created', 'Create attendee profile', 5, 1, 'Account registration')
  on conflict (user_id, event_key) do nothing;

  select * into result from public.profiles where id = auth.uid();
  return result;
end;
$$;


-- Remove access to older overloads and grant only the registration-linked version.
do $$
begin
  if to_regprocedure('public.ensure_profile(text,text,text,text)') is not null then
    execute 'revoke all on function public.ensure_profile(text, text, text, text) from public';
  end if;
end;
$$;
revoke all on function public.ensure_profile(text, text) from public, authenticated;
revoke all on function public.ensure_profile(text, text, text, text, text) from public;
grant execute on function public.ensure_profile(text, text, text, text, text) to authenticated;
