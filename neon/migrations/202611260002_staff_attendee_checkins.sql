begin;

create table if not exists public.attendee_checkins (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references public.profiles(id) on delete set null
);

alter table public.attendee_checkins enable row level security;
revoke all on public.attendee_checkins from public, anonymous, authenticated;

create or replace function public.staff_check_in_attendee(p_qr_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_id uuid;
  target_name text;
  checkin_time timestamptz;
  inserted_count integer;
begin
  if auth.uid() is null or not public.is_event_staff() then
    raise exception 'Organizer authorization required';
  end if;

  select id, name into target_id, target_name
    from public.profiles where qr_token = p_qr_token;
  if target_id is null then raise exception 'Attendee QR is invalid'; end if;

  insert into public.attendee_checkins (profile_id, checked_in_by)
  values (target_id, auth.uid())
  on conflict (profile_id) do nothing;
  get diagnostics inserted_count = row_count;

  select checked_in_at into checkin_time
    from public.attendee_checkins where profile_id = target_id;

  return jsonb_build_object(
    'success', true,
    'name', target_name,
    'already_checked_in', inserted_count = 0,
    'checked_in_at', checkin_time
  );
end;
$$;

create or replace function public.staff_get_checkin_count()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_event_staff() then
    raise exception 'Organizer authorization required';
  end if;
  return (select count(*) from public.attendee_checkins);
end;
$$;

revoke all on function public.staff_check_in_attendee(uuid) from public, anonymous, authenticated;
revoke all on function public.staff_get_checkin_count() from public, anonymous, authenticated;
grant execute on function public.staff_check_in_attendee(uuid) to authenticated;
grant execute on function public.staff_get_checkin_count() to authenticated;

commit;
