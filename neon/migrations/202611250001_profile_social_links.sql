begin;

alter table public.profiles
  add column if not exists social_links jsonb not null default '{}'::jsonb;

create or replace view public.attendee_directory
with (security_barrier = true)
as
select id, name, role, avatar_id, hub_id, bio, company, created_at, social_links
from public.profiles
where not hide_from_public_board;

create or replace view public.my_connections
with (security_barrier = true)
as
select c.id, c.requester_id, c.recipient_id, c.status, c.created_at, c.confirmed_at,
  requester.name as requester_name, requester.role as requester_role,
  requester.avatar_id as requester_avatar_id,
  recipient.name as recipient_name, recipient.role as recipient_role,
  recipient.avatar_id as recipient_avatar_id,
  requester.social_links as requester_social_links,
  recipient.social_links as recipient_social_links
from public.connections c
join public.profiles requester on requester.id = c.requester_id
join public.profiles recipient on recipient.id = c.recipient_id
where c.requester_id = auth.uid() or c.recipient_id = auth.uid();

commit;
