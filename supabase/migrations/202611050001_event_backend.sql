create extension if not exists pgcrypto with schema extensions;

create table if not exists public.staff_allowlist (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_event_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_allowlist
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_event_staff() from public, anon;
grant execute on function public.is_event_staff() to authenticated;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  role text not null default 'builder'
    check (role in ('builder', 'founder', 'designer', 'operator', 'student')),
  avatar_id text not null default 'av-1',
  hub_id text not null default 'hub-jos-innovators',
  bio text not null default '' check (char_length(bio) <= 500),
  company text not null default '' check (char_length(company) <= 100),
  qr_token uuid not null default extensions.gen_random_uuid() unique,
  hide_from_public_board boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participant_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stage1_quests jsonb not null default '[]'::jsonb,
  blitz_state jsonb not null default
    '{"completed":false,"score":0,"correctCount":0,"totalAnswered":0,"speedBonusTotal":0,"completedAt":null}'::jsonb,
  partner_visits jsonb not null default '{}'::jsonb,
  captured_sessions text[] not null default '{}',
  claimed_drops text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.point_ledger (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_key text not null,
  title text not null,
  points integer not null check (points > 0),
  stage smallint not null check (stage between 1 and 4),
  reason text not null default '',
  created_at timestamptz not null default now(),
  reversed_at timestamptz,
  reversal_reason text,
  reversed_by uuid references public.profiles(id),
  unique (user_id, event_key)
);

create table if not exists public.quest_rules (
  quest_id text primary key,
  title text not null,
  points integer not null check (points > 0),
  stage smallint not null check (stage between 1 and 4),
  requires_url boolean not null default false,
  active boolean not null default true
);

insert into public.quest_rules (quest_id, title, points, stage, requires_url) values
  ('q-follow-x', 'Follow TechFest on X', 5, 1, false),
  ('q-follow-li', 'Follow TechFest on LinkedIn', 5, 1, false),
  ('q-post-x', 'Post about TechFest on X', 5, 1, true),
  ('q-post-li', 'Post about TechFest on LinkedIn', 5, 1, true)
on conflict (quest_id) do nothing;

create table if not exists public.event_codes (
  code text primary key,
  kind text not null check (kind in ('partner', 'session', 'signal', 'roundtable')),
  event_id text not null,
  title text not null,
  points integer not null check (points > 0),
  stage smallint not null check (stage between 1 and 4),
  description text not null default '',
  hint text not null default '',
  badge text not null default 'LIVE EVENT',
  claimed_count integer not null default 0,
  claim_limit integer check (claim_limit is null or claim_limit > 0),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  active boolean not null default true,
  check (expires_at > created_at)
);

insert into public.event_codes (code, kind, event_id, title, points, stage) values
  ('JTF26-PICTDA-B01', 'partner', 'partner-pictda', 'Visited PICTDA', 10, 4),
  ('JTF26-SARAU-B02', 'partner', 'partner-sarau', 'Visited Sarau', 10, 4),
  ('JTF26-NHUB-B03', 'partner', 'partner-nhub', 'Visited nHub', 10, 4),
  ('JTF26-ALTSCH-B04', 'partner', 'partner-altschool', 'Visited AltSchool Africa', 10, 4),
  ('JTF26-PAYSTACK-B05', 'partner', 'partner-paystack', 'Visited Paystack', 10, 4),
  ('JTF26-MTN5G-B06', 'partner', 'partner-mtn', 'Visited MTN 5G', 10, 4),
  ('JTF26-GDGJOS-B07', 'partner', 'partner-gdgjos', 'Visited GDG Jos', 10, 4),
  ('JTF26-NITDA-B08', 'partner', 'partner-nitda', 'Visited NITDA', 10, 4),
  ('JTF26-BOIFUND-B09', 'partner', 'partner-boi', 'Visited Bank of Industry', 10, 4),
  ('JTF26-JOSAIC-B10', 'partner', 'partner-josaicollective', 'Visited Jos AI Collective', 10, 4),
  ('JTF26-HALL-KEYNOTE1', 'session', 'sess-1', 'Captured Opening Keynote', 10, 2),
  ('JTF26-HALL-AGRITECH', 'session', 'sess-2', 'Captured Smart Agritech', 10, 2),
  ('JTF26-HALL-FOUNDERS', 'session', 'sess-3', 'Captured Founders Panel', 10, 2),
  ('JTF26-HALL-PAYMENTS', 'session', 'sess-4', 'Captured Automated Rails', 10, 2),
  ('JTF26-HALL-EDGEAI', 'session', 'sess-5', 'Captured Industrial IoT', 10, 2),
  ('JTF26-HALL-FINALE', 'session', 'sess-6', 'Captured Grand Finale', 10, 2),
  ('JTF26-SIGNAL-GOLDEN-COFFEE', 'signal', 'drop-coffee-gold', 'Golden QR at the Coffee Station', 25, 2),
  ('JTF26-SIGNAL-SPEAKER-TALK', 'signal', 'drop-speaker-selfie', 'Spot the Keynote Speaker', 20, 2),
  ('JTF26-SIGNAL-AGRO-IOT', 'signal', 'drop-iot-demo', 'Inspect the Live IoT Agro-Sorter', 15, 2)
on conflict (code) do nothing;

delete from public.event_codes;

create table if not exists public.connections (
  id uuid primary key default extensions.gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  check (requester_id <> recipient_id),
  unique (requester_id, recipient_id)
);

create unique index if not exists connections_one_per_attendee_pair
  on public.connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));

create table if not exists public.quiz_attempts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  answers integer[],
  score integer,
  correct_count integer,
  completed_at timestamptz
);

create table if not exists public.quiz_answer_key (
  question_index smallint primary key check (question_index between 0 and 9),
  correct_index smallint not null check (correct_index between 0 and 3)
);

insert into public.quiz_answer_key (question_index, correct_index) values
  (0, 2), (1, 0), (2, 3), (3, 1), (4, 2),
  (5, 1), (6, 3), (7, 0), (8, 2), (9, 3)
on conflict (question_index) do update set correct_index = excluded.correct_index;

create table if not exists public.partner_task_answer_key (
  partner_id text primary key,
  correct_index smallint not null check (correct_index between 0 and 3)
);

insert into public.partner_task_answer_key (partner_id, correct_index)
values
  ('partner-pictda', 2),
  ('partner-sarau', 0),
  ('partner-nhub', 3),
  ('partner-altschool', 1),
  ('partner-paystack', 2),
  ('partner-mtn', 1),
  ('partner-gdgjos', 3),
  ('partner-nitda', 0),
  ('partner-boi', 3),
  ('partner-josaicollective', 3)
on conflict (partner_id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
  profile_role text;
begin
  profile_name := left(trim(coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1))), 60);
  profile_role := coalesce(new.raw_user_meta_data ->> 'role', 'builder');
  if profile_role not in ('builder', 'founder', 'designer', 'operator', 'student') then
    profile_role := 'builder';
  end if;

  insert into public.profiles (id, name, role)
  values (new.id, profile_name, profile_role);
  insert into public.participant_state (user_id) values (new.id);
  insert into public.point_ledger (user_id, event_key, title, points, stage, reason)
  values (new.id, 'profile-created', 'Create attendee profile', 5, 1, 'Verified email registration');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.award_points(
  p_user_id uuid,
  p_event_key text,
  p_title text,
  p_points integer,
  p_stage smallint,
  p_reason text
)
returns public.point_ledger
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.point_ledger;
begin
  insert into public.point_ledger (user_id, event_key, title, points, stage, reason)
  values (p_user_id, p_event_key, p_title, p_points, p_stage, p_reason)
  on conflict (user_id, event_key) do nothing
  returning * into result;
  return result;
end;
$$;

revoke all on function public.award_points(uuid, text, text, integer, smallint, text) from public, anon, authenticated;

create or replace function public.complete_stage_quest(p_quest_id text, p_input_url text default '')
returns public.point_ledger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rule public.quest_rules;
  result public.point_ledger;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into rule from public.quest_rules where quest_id = p_quest_id and active;
  if not found then raise exception 'Unknown or inactive quest'; end if;
  if rule.requires_url and (
    length(trim(coalesce(p_input_url, ''))) < 12
    or p_input_url !~* '^https://(www\.)?(x\.com|twitter\.com|linkedin\.com)/'
  ) then
    raise exception 'Submit a valid public X or LinkedIn post URL';
  end if;
  result := public.award_points(auth.uid(), rule.quest_id, rule.title, rule.points, rule.stage,
    case when rule.requires_url then 'Self-submitted public post URL; subject to organizer review'
         else 'Attendee self-reported quest completion' end);
  if result.id is null then raise exception 'Quest was already completed'; end if;
  return result;
end;
$$;

create or replace function public.claim_event_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_code public.event_codes;
  result public.point_ledger;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into event_code
  from public.event_codes
  where code = upper(trim(p_code)) and active and expires_at > now()
  for update;
  if not found then raise exception 'Event code is invalid or inactive'; end if;
  if event_code.claim_limit is not null and event_code.claimed_count >= event_code.claim_limit then
    raise exception 'This event code has reached its claim limit';
  end if;
  result := public.award_points(auth.uid(), 'event:' || event_code.event_id, event_code.title,
    event_code.points, event_code.stage, 'Event QR scan');
  if result.id is null then raise exception 'This event code was already claimed'; end if;
  update public.event_codes set claimed_count = claimed_count + 1 where code = event_code.code;
  if event_code.kind = 'partner' then
    update public.participant_state
    set partner_visits = partner_visits || jsonb_build_object(event_code.event_id,
      jsonb_build_object('scanned', true, 'taskCompleted', false, 'points', event_code.points)),
      updated_at = now()
    where user_id = auth.uid();
  elsif event_code.kind = 'session' then
    update public.participant_state
    set captured_sessions = array(select distinct unnest(captured_sessions || event_code.event_id)),
      updated_at = now()
    where user_id = auth.uid();
  elsif event_code.kind = 'signal' then
    update public.participant_state
    set claimed_drops = array(select distinct unnest(claimed_drops || event_code.event_id)),
      updated_at = now()
    where user_id = auth.uid();
  end if;
  return jsonb_build_object('kind', event_code.kind, 'event_id', event_code.event_id,
    'title', event_code.title, 'points', event_code.points, 'stage', event_code.stage);
end;
$$;

create or replace function public.staff_create_event_code(
  p_kind text,
  p_event_id text,
  p_title text,
  p_points integer,
  p_stage smallint,
  p_description text default '',
  p_hint text default '',
  p_claim_limit integer default null,
  p_correct_answer integer default 0,
  p_expiration_minutes integer default 10
)
returns public.event_codes
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.event_codes;
begin
  if not public.is_event_staff() then raise exception 'Organizer authorization required'; end if;
  if p_kind not in ('partner', 'session', 'signal', 'roundtable')
    or p_points not between 1 and 50
    or p_stage not between 1 and 4
    or length(trim(coalesce(p_title, ''))) not between 3 and 100
    or length(trim(coalesce(p_event_id, ''))) not between 3 and 80
    or (p_claim_limit is not null and p_claim_limit < 1)
    or p_correct_answer not between 0 and 3
    or p_expiration_minutes not between 1 and 1440
  then raise exception 'Invalid event code details'; end if;

  insert into public.event_codes
    (code, kind, event_id, title, points, stage, description, hint, badge, claim_limit, expires_at)
  values
    ('JTF26-' || upper(p_kind) || '-' || upper(encode(extensions.gen_random_bytes(12), 'hex')),
     p_kind, p_event_id, trim(p_title), p_points, p_stage,
     left(trim(coalesce(p_description, '')), 500), left(trim(coalesce(p_hint, '')), 160),
     case p_kind when 'signal' then 'LIVE DROP' when 'partner' then 'PARTNER BOOTH'
       when 'session' then 'SESSION' else 'CHECK-IN' end, p_claim_limit,
     now() + make_interval(mins => p_expiration_minutes))
  returning * into result;
  if p_kind = 'partner' then
    insert into public.partner_task_answer_key (partner_id, correct_index)
    values (p_event_id, p_correct_answer)
    on conflict (partner_id) do nothing;
  end if;
  return result;
end;
$$;

create or replace function public.complete_partner_task(p_partner_id text, p_answer integer)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  answer_key smallint;
  result public.point_ledger;
  partner_title text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select correct_index into answer_key from public.partner_task_answer_key where partner_id = p_partner_id;
  if not found then raise exception 'Partner task is unavailable'; end if;
  if p_answer is null or p_answer <> answer_key then return jsonb_build_object('correct', false); end if;
  if not exists (
    select 1 from public.point_ledger where user_id = auth.uid()
      and event_key = 'event:' || p_partner_id
      and reversed_at is null
  ) then raise exception 'Scan this partner booth QR before attempting its challenge'; end if;
  select title into partner_title from public.event_codes where event_id = p_partner_id and kind = 'partner';
  result := public.award_points(auth.uid(), 'partner-task:' || p_partner_id,
    partner_title || ' Challenge Completed', 15, 4, 'Server-checked partner challenge');
  if result.id is null then raise exception 'This partner challenge was already completed'; end if;
  update public.participant_state
  set partner_visits = jsonb_set(partner_visits, array[p_partner_id],
    coalesce(partner_visits -> p_partner_id, '{}'::jsonb)
      || jsonb_build_object('taskCompleted', true, 'points', 25), true),
    updated_at = now()
  where user_id = auth.uid();
  return jsonb_build_object('correct', true, 'points', 15);
end;
$$;

create or replace function public.request_connection(p_qr_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles;
  connection_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into target from public.profiles where qr_token = p_qr_token;
  if not found then raise exception 'Attendee QR is invalid'; end if;
  if target.id = auth.uid() then raise exception 'You cannot connect to yourself'; end if;

  insert into public.connections (requester_id, recipient_id)
  values (auth.uid(), target.id)
  on conflict (requester_id, recipient_id) do nothing
  returning id into connection_id;
  if connection_id is null then raise exception 'A connection request already exists'; end if;

  return jsonb_build_object('id', connection_id, 'status', 'pending',
    'recipient_id', target.id, 'name', target.name, 'role', target.role, 'avatar_id', target.avatar_id);
end;
$$;

create or replace function public.request_connection_by_id(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.profiles;
  connection_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into target from public.profiles where id = p_profile_id and not hide_from_public_board;
  if not found then raise exception 'Attendee is unavailable'; end if;
  if target.id = auth.uid() then raise exception 'You cannot connect to yourself'; end if;

  insert into public.connections (requester_id, recipient_id)
  values (auth.uid(), target.id)
  on conflict (requester_id, recipient_id) do nothing
  returning id into connection_id;
  if connection_id is null then raise exception 'A connection request already exists'; end if;

  return jsonb_build_object('id', connection_id, 'status', 'pending',
    'recipient_id', target.id, 'name', target.name, 'role', target.role, 'avatar_id', target.avatar_id);
end;
$$;

create or replace function public.confirm_connection(p_connection_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  item public.connections;
  other_profile public.profiles;
  pts integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into item from public.connections
  where id = p_connection_id and recipient_id = auth.uid() and status = 'pending'
  for update;
  if not found then raise exception 'Connection request is unavailable'; end if;
  select * into other_profile from public.profiles where id = item.requester_id;
  pts := case when other_profile.role <> (select role from public.profiles where id = auth.uid()) then 15 else 10 end;
  update public.connections set status = 'confirmed', confirmed_at = now() where id = item.id;
  perform public.award_points(auth.uid(), 'connection:' || item.requester_id::text,
    'Connected with ' || other_profile.name, pts, 2, 'Confirmed attendee connection');
  perform public.award_points(item.requester_id, 'connection:' || auth.uid()::text,
    'Connected with ' || (select name from public.profiles where id = auth.uid()), pts, 2,
    'Connection accepted by attendee');
  return jsonb_build_object('id', item.id, 'status', 'confirmed', 'points', pts);
end;
$$;

create or replace function public.save_participant_state(p_state jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.participant_state
  set stage1_quests = coalesce(p_state -> 'stage1_quests', stage1_quests),
      blitz_state = coalesce(p_state -> 'blitz_state', blitz_state),
      partner_visits = coalesce(p_state -> 'partner_visits', partner_visits),
      captured_sessions = coalesce(array(select jsonb_array_elements_text(p_state -> 'captured_sessions')), captured_sessions),
      claimed_drops = coalesce(array(select jsonb_array_elements_text(p_state -> 'claimed_drops')), claimed_drops),
      updated_at = now()
  where user_id = auth.uid();
end;
$$;

create or replace function public.submit_prompt_blitz(p_answers integer[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  correct integer;
  score_value integer;
  saved_user_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(auth.uid()::text || ':prompt-blitz', 0)
  );
  if p_answers is null or cardinality(p_answers) <> 10 or exists (
    select 1 from unnest(p_answers) answer where answer is null or answer < -1 or answer > 3
  ) then raise exception 'Quiz submission is invalid'; end if;
  if exists (select 1 from public.quiz_attempts where user_id = auth.uid() and completed_at is not null) then
    raise exception 'Prompt Blitz was already submitted';
  end if;

  select count(*) into correct
  from unnest(p_answers) with ordinality submitted(answer, index)
  join public.quiz_answer_key key on key.question_index = submitted.index - 1
    and key.correct_index = submitted.answer;
  score_value := correct * 10;

  insert into public.quiz_attempts (user_id, answers, score, correct_count, completed_at)
  values (auth.uid(), p_answers, score_value, correct, now())
  on conflict (user_id) do update
    set answers = excluded.answers, score = excluded.score,
        correct_count = excluded.correct_count, completed_at = excluded.completed_at
    where public.quiz_attempts.completed_at is null
  returning user_id into saved_user_id;
  if saved_user_id is null then raise exception 'Prompt Blitz was already submitted'; end if;

  if score_value > 0 then
    perform public.award_points(auth.uid(), 'prompt-blitz-final', 'Prompt Blitz AI Quiz',
      score_value, 3, 'Server-scored quiz submission');
  end if;
  update public.participant_state
  set blitz_state = jsonb_build_object(
      'completed', true, 'score', score_value, 'correctCount', correct,
      'totalAnswered', 10, 'speedBonusTotal', 0, 'completedAt', now())
  where user_id = auth.uid();
  return jsonb_build_object('score', score_value, 'correct_count', correct, 'total_answered', 10);
end;
$$;

create or replace function public.get_event_access()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object('is_staff', public.is_event_staff());
$$;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = auth.uid();
end;
$$;

create or replace function public.staff_reverse_points(p_ledger_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item public.point_ledger;
begin
  if not public.is_event_staff() then raise exception 'Organizer authorization required'; end if;
  if length(trim(coalesce(p_reason, ''))) < 4 then raise exception 'A reversal reason is required'; end if;
  select * into item from public.point_ledger
  where id = p_ledger_id and reversed_at is null and title not like 'Reversal:%'
  for update;
  if not found then raise exception 'Ledger entry is already reversed or unavailable'; end if;
  update public.point_ledger set reversed_at = now(), reversal_reason = trim(p_reason),
    reversed_by = auth.uid() where id = p_ledger_id;
  insert into public.point_ledger (user_id, event_key, title, points, stage, reason)
  values (item.user_id, 'reversal:' || item.id::text, 'Reversal: ' || item.title, item.points,
    item.stage, trim(p_reason));
end;
$$;

create or replace view public.attendee_directory
with (security_barrier = true)
as
select id, name, role, avatar_id, hub_id, bio, company, created_at
from public.profiles
where not hide_from_public_board;

create or replace view public.active_event_catalog
with (security_barrier = true)
as
select event_id as id, kind, title, points, stage, description, hint, badge, claimed_count, claim_limit
from public.event_codes
where active and expires_at > now();

create or replace view public.staff_event_codes
with (security_barrier = true)
as
select * from public.event_codes
where public.is_event_staff();

create or replace view public.my_connections
with (security_barrier = true)
as
select c.id, c.requester_id, c.recipient_id, c.status, c.created_at, c.confirmed_at,
  requester.name as requester_name, requester.role as requester_role,
  requester.avatar_id as requester_avatar_id,
  recipient.name as recipient_name, recipient.role as recipient_role,
  recipient.avatar_id as recipient_avatar_id
from public.connections c
join public.profiles requester on requester.id = c.requester_id
join public.profiles recipient on recipient.id = c.recipient_id
where c.requester_id = auth.uid() or c.recipient_id = auth.uid();

create or replace view public.leaderboard
with (security_barrier = true)
as
select p.id, p.name, p.role, p.avatar_id, p.hub_id,
  coalesce(sum(l.points) filter (where l.reversed_at is null and l.title not like 'Reversal:%'), 0)::integer as points
from public.profiles p
left join public.point_ledger l on l.user_id = p.id
where not p.hide_from_public_board
group by p.id;

create or replace view public.staff_ledger
with (security_barrier = true)
as
select l.*, p.name as attendee_name, p.role as attendee_role
from public.point_ledger l join public.profiles p on p.id = l.user_id
where public.is_event_staff();

alter table public.staff_allowlist enable row level security;
alter table public.profiles enable row level security;
alter table public.participant_state enable row level security;
alter table public.point_ledger enable row level security;
alter table public.quest_rules enable row level security;
alter table public.event_codes enable row level security;
alter table public.connections enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answer_key enable row level security;
alter table public.partner_task_answer_key enable row level security;

drop policy if exists "Profiles are private to owner" on public.profiles;
create policy "Profiles are private to owner" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_event_staff());
drop policy if exists "Attendees update their profile" on public.profiles;
create policy "Attendees update their profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "Read own participant state" on public.participant_state;
create policy "Read own participant state" on public.participant_state
for select to authenticated using (user_id = auth.uid());

drop policy if exists "Read own point ledger" on public.point_ledger;
create policy "Read own point ledger" on public.point_ledger
for select to authenticated using (user_id = auth.uid() or public.is_event_staff());

drop policy if exists "Read own connections" on public.connections;
create policy "Read own connections" on public.connections
for select to authenticated using (requester_id = auth.uid() or recipient_id = auth.uid() or public.is_event_staff());

drop policy if exists "Read own quiz attempt" on public.quiz_attempts;
create policy "Read own quiz attempt" on public.quiz_attempts
for select to authenticated using (user_id = auth.uid());

revoke all on public.staff_allowlist, public.quest_rules, public.event_codes, public.quiz_answer_key,
  public.partner_task_answer_key from anon, authenticated;
revoke all on public.profiles, public.participant_state, public.point_ledger, public.connections, public.quiz_attempts from anon, authenticated;
grant select on public.profiles, public.participant_state, public.point_ledger, public.connections, public.quiz_attempts to authenticated;
grant update (name, avatar_id, hub_id, bio, company, hide_from_public_board) on public.profiles to authenticated;
grant select on public.attendee_directory, public.leaderboard to authenticated;
grant select on public.active_event_catalog to authenticated;
grant select on public.staff_ledger, public.staff_event_codes, public.my_connections to authenticated;

revoke all on function public.complete_stage_quest(text, text) from public, anon;
revoke all on function public.claim_event_code(text) from public, anon;
revoke all on function public.staff_create_event_code(text, text, text, integer, smallint, text, text, integer, integer, integer) from public, anon;
revoke all on function public.complete_partner_task(text, integer) from public, anon;
revoke all on function public.request_connection(uuid) from public, anon;
revoke all on function public.request_connection_by_id(uuid) from public, anon;
revoke all on function public.confirm_connection(uuid) from public, anon;
revoke all on function public.save_participant_state(jsonb) from public, anon;
revoke all on function public.save_participant_state(jsonb) from authenticated;
revoke all on function public.submit_prompt_blitz(integer[]) from public, anon;
revoke all on function public.get_event_access() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.staff_reverse_points(uuid, text) from public, anon;
grant execute on function public.complete_stage_quest(text, text) to authenticated;
grant execute on function public.claim_event_code(text) to authenticated;
grant execute on function public.staff_create_event_code(text, text, text, integer, smallint, text, text, integer, integer, integer) to authenticated;
grant execute on function public.complete_partner_task(text, integer) to authenticated;
grant execute on function public.request_connection(uuid) to authenticated;
grant execute on function public.request_connection_by_id(uuid) to authenticated;
grant execute on function public.confirm_connection(uuid) to authenticated;
grant execute on function public.submit_prompt_blitz(integer[]) to authenticated;
grant execute on function public.get_event_access() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.staff_reverse_points(uuid, text) to authenticated;

grant usage on schema public to authenticated;
