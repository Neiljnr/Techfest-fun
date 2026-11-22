-- Server-managed mapping from a passwordless Quest identity to its registration.
-- The browser roles have no access to this table.
create table if not exists public.quest_guest_accounts (
  user_id uuid primary key references neon_auth."user"(id) on delete cascade,
  registration_email text not null references public.quest_registration_lookup(email) on delete cascade,
  created_at timestamptz not null default now(),
  unique (registration_email)
);
revoke all on public.quest_guest_accounts from public, anonymous, authenticated;
grant select, insert on public.quest_guest_accounts to quest_sync;
grant usage on schema neon_auth to quest_sync;
grant select (id, email) on table neon_auth."user" to quest_sync;

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
  normalized_registration_email text;
  profile_name text;
  profile_role text;
  registration public.quest_registration_lookup;
  result public.profiles;
  guest_linked boolean := false;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select email into account_email from neon_auth."user" where id = auth.uid();
  if not found then raise exception 'Account not found'; end if;

  normalized_registration_email := lower(trim(p_registration_email));
  if normalized_registration_email is not null and normalized_registration_email <> '' then
    select exists (
      select 1 from public.quest_guest_accounts
       where user_id = auth.uid() and registration_email = normalized_registration_email
    ) into guest_linked;
  end if;

  select * into result from public.profiles where id = auth.uid();
  if found then
    -- Preserve old accounts while linking their confirmed registration details.
    if normalized_registration_email = lower(account_email) or guest_linked then
      update public.profiles
         set registration_email = coalesce(registration_email, normalized_registration_email),
             bio = case when (bio is null or trim(bio) = '') and p_attendee_type is not null
                        then 'Techfest: ' || p_attendee_type else bio end,
             company = case when (company is null or trim(company) = '') and p_organization is not null
                            then p_organization else company end
       where id = auth.uid();
    end if;
    select * into result from public.profiles where id = auth.uid();
    return result;
  end if;

  if normalized_registration_email is null or normalized_registration_email = '' then
    raise exception 'Use the email address from your TechFest registration';
  end if;
  if normalized_registration_email <> lower(account_email) and not guest_linked then
    raise exception 'Registration is not linked to this account';
  end if;

  select * into registration from public.quest_registration_lookup
   where email = normalized_registration_email limit 1;
  if not found then raise exception 'No TechFest registration matches this account'; end if;
  p_attendee_type := coalesce(p_attendee_type, registration.attendee_type);
  p_organization := coalesce(p_organization, registration.organization);
  profile_name := left(trim(coalesce(nullif(trim(p_name), ''), registration.full_name)), 60);
  if profile_name = '' then profile_name := 'Attendee'; end if;
  profile_role := coalesce(p_role, 'builder');
  if profile_role not in ('builder', 'founder', 'designer', 'operator', 'student') then profile_role := 'builder'; end if;

  insert into public.profiles (id, name, role, bio, company, registration_email)
  values (auth.uid(), profile_name, profile_role,
          coalesce(case when p_attendee_type is not null then 'Techfest: ' || p_attendee_type end, ''),
          coalesce(p_organization, ''), normalized_registration_email)
  on conflict (id) do nothing;
  insert into public.participant_state (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  insert into public.point_ledger (user_id, event_key, title, points, stage, reason)
  values (auth.uid(), 'profile-created', 'Create attendee profile', 5, 1, 'Account registration')
  on conflict (user_id, event_key) do nothing;
  select * into result from public.profiles where id = auth.uid();
  return result;
end;
$$;

do $$
begin
  if to_regprocedure('public.ensure_profile(text,text,text,text)') is not null then
    execute 'revoke all on function public.ensure_profile(text, text, text, text) from public, anonymous, authenticated';
  end if;
end;
$$;
revoke all on function public.ensure_profile(text, text) from public, anonymous, authenticated;
revoke all on function public.ensure_profile(text, text, text, text, text) from public, anonymous;
grant execute on function public.ensure_profile(text, text, text, text, text) to authenticated;
