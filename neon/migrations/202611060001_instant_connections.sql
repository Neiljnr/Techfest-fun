-- Instant connections, notifications, 4 roles, public screen feed.
-- Applied to the live database via the Neon MCP; kept here for reproducibility.

update public.profiles set role = 'builder' where role = 'operator';
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('builder', 'founder', 'designer', 'student'));
-- ensure_profile must also reject 'operator' in its role list (see live definition).

update public.connections set status = 'confirmed', confirmed_at = coalesce(confirmed_at, now())
  where status = 'pending';
drop function if exists public.confirm_connection(uuid);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  title text not null,
  body text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
create policy notifications_select_own on public.notifications
  for select to authenticated using (user_id = auth.uid());
grant select on public.notifications to authenticated;

create or replace function public.make_connection(p_actor uuid, p_target uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare actor public.profiles; target public.profiles; connection_id uuid; pts integer;
begin
  select * into actor from public.profiles where id = p_actor;
  select * into target from public.profiles where id = p_target;
  if actor.id is null or target.id is null then raise exception 'Attendee is unavailable'; end if;
  if actor.id = target.id then raise exception 'You cannot connect to yourself'; end if;
  if exists (select 1 from public.connections
    where (requester_id = actor.id and recipient_id = target.id)
       or (requester_id = target.id and recipient_id = actor.id)) then
    raise exception 'You are already connected with this attendee';
  end if;
  pts := case when actor.role <> target.role then 15 else 10 end;
  begin
    insert into public.connections (requester_id, recipient_id, status, confirmed_at)
    values (actor.id, target.id, 'confirmed', now()) returning id into connection_id;
  exception when unique_violation then
    raise exception 'You are already connected with this attendee';
  end;
  perform public.award_points(actor.id, 'connection:' || target.id::text, 'Connected with ' || target.name, pts, 2::smallint, 'Attendee connection');
  perform public.award_points(target.id, 'connection:' || actor.id::text, 'Connected with ' || actor.name, pts, 2::smallint, 'Attendee connection');
  insert into public.notifications (user_id, kind, title, body)
  values (target.id, 'connection', actor.name || ' connected with you', '+' || pts || ' points ' || chr(183) || ' ' || initcap(actor.role));
  return jsonb_build_object('id', connection_id, 'status', 'confirmed', 'points', pts,
    'recipient_id', target.id, 'name', target.name, 'role', target.role, 'avatar_id', target.avatar_id);
end; $$;
revoke all on function public.make_connection(uuid, uuid) from public, anon, authenticated;

create or replace function public.request_connection(p_qr_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into target_id from public.profiles where qr_token = p_qr_token;
  if target_id is null then raise exception 'Attendee QR is invalid'; end if;
  return public.make_connection(auth.uid(), target_id);
end; $$;

create or replace function public.request_connection_by_id(p_profile_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.profiles where id = p_profile_id and not hide_from_public_board) then
    raise exception 'Attendee is unavailable';
  end if;
  return public.make_connection(auth.uid(), p_profile_id);
end; $$;

create or replace function public.mark_notifications_read()
returns void language sql security definer set search_path = '' as
$$ update public.notifications set read_at = now() where user_id = auth.uid() and read_at is null $$;
grant execute on function public.mark_notifications_read() to authenticated;

-- Public big-screen feed (/screen via /api/leaderboard). Create the role with a password
-- in the Neon console, then store its connection string as SCREEN_DATABASE_URL.
create or replace view public.screen_leaderboard as
  select id, name, role, avatar_id, points from public.leaderboard;
-- create role screen_reader login password '<set-in-console>';
grant usage on schema public to screen_reader;
grant select on public.screen_leaderboard to screen_reader;
