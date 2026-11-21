-- Migration: 202611210001_registration_lookup
-- Description: Add registration lookup function, update ensure_profile with attendee info,
--              and add registration_email column to profiles.

--------------------------------------------------------------------------------
-- 1. lookup_registration(p_identifier text)
--    Searches techfest_registrations by email (exact, case-insensitive) first,
--    then by full_name (case-insensitive, trimmed). Returns limited info for privacy.
--    Callable by anon (pre-auth) and authenticated roles.
--------------------------------------------------------------------------------

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
    from public.techfest_registrations
   where lower(email) = identifier_trimmed
   limit 1;

  if not found then
    -- Fall back to full_name match (case-insensitive, trimmed)
    select full_name, email, attendee_type, organization, registration_type
      into reg
      from public.techfest_registrations
     where lower(trim(full_name)) = identifier_trimmed
     limit 1;
  end if;

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
grant execute on function public.lookup_registration(text) to anon;
grant execute on function public.lookup_registration(text) to authenticated;

--------------------------------------------------------------------------------
-- 2. Add registration_email column to profiles (nullable, for linking back)
--------------------------------------------------------------------------------

alter table public.profiles
  add column if not exists registration_email text;

--------------------------------------------------------------------------------
-- 3. Update ensure_profile to accept p_attendee_type and p_organization,
--    storing them in bio and company when those fields are empty.
--------------------------------------------------------------------------------

create or replace function public.ensure_profile(
  p_name text default null,
  p_role text default null,
  p_attendee_type text default null,
  p_organization text default null
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

  profile_name := left(trim(coalesce(nullif(trim(p_name), ''), split_part(account_email, '@', 1))), 60);
  if profile_name = '' then profile_name := 'Attendee'; end if;

  profile_role := coalesce(p_role, 'builder');
  if profile_role not in ('builder', 'founder', 'designer', 'operator', 'student') then
    profile_role := 'builder';
  end if;

  insert into public.profiles (id, name, role, bio, company)
  values (
    auth.uid(),
    profile_name,
    profile_role,
    coalesce(case when p_attendee_type is not null then 'Techfest: ' || p_attendee_type end, ''),
    coalesce(p_organization, '')
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


-- Re-grant execute on the updated ensure_profile (now has 4 params)
revoke all on function public.ensure_profile(text, text, text, text) from public;
grant execute on function public.ensure_profile(text, text, text, text) to authenticated;
