begin;

insert into public.quest_rules (quest_id, title, points, stage, requires_url, active) values
  ('q-follow-rexc4-li', 'Follow RexC4 on LinkedIn', 3, 1, false, true),
  ('q-follow-rexc4-x', 'Follow RexC4 on X', 3, 1, false, true),
  ('q-follow-rexc4-fb', 'Follow RexC4 on Facebook', 3, 1, false, true),
  ('q-follow-laskadapp-fb', 'Follow Laskad on Facebook', 3, 1, false, true),
  ('q-follow-ajecars-ig', 'Follow Aje Cars on Instagram', 3, 1, false, true),
  ('q-follow-ajecars-tiktok', 'Follow Aje Cars on TikTok', 3, 1, false, true)
on conflict (quest_id) do update
set title = excluded.title,
    points = excluded.points,
    stage = excluded.stage,
    requires_url = excluded.requires_url,
    active = excluded.active;

commit;
