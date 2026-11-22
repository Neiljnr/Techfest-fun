-- Add the TechFest, partner, and community channels to Stage One.
-- Existing quest completions and scores remain unchanged.

insert into public.quest_rules (quest_id, title, points, stage, requires_url, active) values
  ('q-follow-li', 'Follow Jos TechFest on LinkedIn', 5, 1, false, true),
  ('q-follow-fb-techfest', 'Find TechFest on Facebook', 3, 1, false, true),
  ('q-follow-fb-community', 'Unlock the Facebook community signal', 3, 1, false, true),
  ('q-follow-axiahub', 'Connect with AxiaHub', 3, 1, false, true),
  ('q-follow-bluehouse', 'Connect with Bluehouse Technologies', 3, 1, false, true),
  ('q-follow-nhub', 'Connect with nHub Nigeria', 3, 1, false, true)
on conflict (quest_id) do update
set title = excluded.title,
    points = excluded.points,
    stage = excluded.stage,
    requires_url = excluded.requires_url,
    active = excluded.active;
