-- Organizer-controlled stages and quiz, fixes for quiz/partner scoring, scan-only connections.

-- 1. Stage switches. Stages 1-2 are open by default; 3 (quiz) and 4 (partners) wait for an announcement.
create table if not exists public.stage_settings (
  stage smallint primary key check (stage between 1 and 4),
  active boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into public.stage_settings (stage, active) values (1, true), (2, true), (3, false), (4, false)
  on conflict (stage) do nothing;
alter table public.stage_settings enable row level security;
create policy stage_settings_read on public.stage_settings for select to authenticated using (true);
grant select on public.stage_settings to authenticated;

create or replace function public.require_stage_open(p_stage smallint)
returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.stage_settings where stage = p_stage and active) then
    raise exception 'Stage % is not open yet. Wait for the organizers'' announcement.', p_stage;
  end if;
end; $$;

-- 2. Organizer-managed quiz questions. Answers never leave the server except to staff.
create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  topic text not null default '',
  question text not null,
  options text[] not null check (cardinality(options) = 4),
  correct_index smallint not null check (correct_index between 0 and 3),
  explanation text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.quiz_questions enable row level security;

create or replace view public.quiz_questions_public as
  select id, sort_order, topic, question, options from public.quiz_questions q
  where q.active and exists (select 1 from public.stage_settings where stage = 3 and active)
  order by sort_order, created_at;
create or replace view public.staff_quiz_questions as
  select * from public.quiz_questions where public.is_event_staff() order by sort_order, created_at;
grant select on public.quiz_questions_public, public.staff_quiz_questions to authenticated;

-- 3. Quiz scoring from the live question table (10 points per correct answer).
drop function if exists public.submit_prompt_blitz(integer[]);
create or replace function public.submit_prompt_blitz(p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare total integer; correct integer; score_value integer; saved_user_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform public.require_stage_open(3::smallint);
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text || ':prompt-blitz', 0));
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'Quiz submission is invalid'; end if;
  if exists (select 1 from public.quiz_attempts where user_id = auth.uid() and completed_at is not null) then
    raise exception 'Prompt Blitz was already submitted';
  end if;
  select count(*), count(*) filter (where (p_answers ->> q.id::text) ~ '^-?[0-9]+$' and (p_answers ->> q.id::text)::int = q.correct_index)
    into total, correct from public.quiz_questions q where q.active;
  if total = 0 then raise exception 'The quiz has no questions yet'; end if;
  score_value := correct * 10;
  insert into public.quiz_attempts (user_id, answers, score, correct_count, completed_at)
  values (auth.uid(), '{}', score_value, correct, now())
  on conflict (user_id) do update set score = excluded.score, correct_count = excluded.correct_count, completed_at = excluded.completed_at
    where public.quiz_attempts.completed_at is null
  returning user_id into saved_user_id;
  if saved_user_id is null then raise exception 'Prompt Blitz was already submitted'; end if;
  if score_value > 0 then
    perform public.award_points(auth.uid(), 'prompt-blitz-final', 'Prompt Blitz AI Quiz', score_value, 3::smallint, 'Server-scored quiz submission');
  end if;
  update public.participant_state set blitz_state = jsonb_build_object('completed', true, 'score', score_value,
    'correctCount', correct, 'totalAnswered', total, 'speedBonusTotal', 0, 'completedAt', now()) where user_id = auth.uid();
  return jsonb_build_object('score', score_value, 'correct_count', correct, 'total_answered', total);
end; $$;
grant execute on function public.submit_prompt_blitz(jsonb) to authenticated;

-- 4. Partner challenges: stage 4 gate and smallint fix.
create or replace function public.complete_partner_task(p_partner_id text, p_answer integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare answer_key smallint; result public.point_ledger; partner_title text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform public.require_stage_open(4::smallint);
  select correct_index into answer_key from public.partner_task_answer_key where partner_id = p_partner_id;
  if not found then raise exception 'Partner task is unavailable'; end if;
  if not exists (select 1 from public.point_ledger where user_id = auth.uid() and event_key = 'event:' || p_partner_id and reversed_at is null) then
    raise exception 'Scan this partner booth QR before attempting its challenge';
  end if;
  if p_answer is null or p_answer <> answer_key then return jsonb_build_object('correct', false); end if;
  select title into partner_title from public.event_codes where event_id = p_partner_id and kind = 'partner';
  result := public.award_points(auth.uid(), 'partner-task:' || p_partner_id, coalesce(partner_title, p_partner_id) || ' Challenge Completed', 15, 4::smallint, 'Server-checked partner challenge');
  if result.id is null then raise exception 'This partner challenge was already completed'; end if;
  update public.participant_state set partner_visits = jsonb_set(partner_visits, array[p_partner_id],
    coalesce(partner_visits -> p_partner_id, '{}'::jsonb) || jsonb_build_object('taskCompleted', true, 'points', 25), true), updated_at = now()
  where user_id = auth.uid();
  return jsonb_build_object('correct', true, 'points', 15);
end; $$;

-- 5. Other scoring paths respect the stage switches.
create or replace function public.claim_event_code(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare event_code public.event_codes; result public.point_ledger;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into event_code from public.event_codes where code = upper(trim(p_code)) and active and expires_at > now() for update;
  if not found then raise exception 'Event code is invalid or inactive'; end if;
  perform public.require_stage_open(event_code.stage);
  if event_code.claim_limit is not null and event_code.claimed_count >= event_code.claim_limit then
    raise exception 'This event code has reached its claim limit';
  end if;
  result := public.award_points(auth.uid(), 'event:' || event_code.event_id, event_code.title, event_code.points, event_code.stage, 'Event QR scan');
  if result.id is null then raise exception 'This event code was already claimed'; end if;
  update public.event_codes set claimed_count = claimed_count + 1 where code = event_code.code;
  if event_code.kind = 'partner' then
    update public.participant_state set partner_visits = partner_visits || jsonb_build_object(event_code.event_id,
      jsonb_build_object('scanned', true, 'taskCompleted', false, 'points', event_code.points)), updated_at = now() where user_id = auth.uid();
  elsif event_code.kind = 'session' then
    update public.participant_state set captured_sessions = array(select distinct unnest(captured_sessions || event_code.event_id)), updated_at = now() where user_id = auth.uid();
  elsif event_code.kind = 'signal' then
    update public.participant_state set claimed_drops = array(select distinct unnest(claimed_drops || event_code.event_id)), updated_at = now() where user_id = auth.uid();
  end if;
  return jsonb_build_object('kind', event_code.kind, 'event_id', event_code.event_id, 'title', event_code.title, 'points', event_code.points, 'stage', event_code.stage);
end; $$;

create or replace function public.complete_stage_quest(p_quest_id text, p_input_url text default '')
returns public.point_ledger language plpgsql security definer set search_path = '' as $$
declare rule public.quest_rules; result public.point_ledger;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into rule from public.quest_rules where quest_id = p_quest_id and active;
  if not found then raise exception 'Unknown or inactive quest'; end if;
  perform public.require_stage_open(rule.stage);
  if rule.requires_url and (length(trim(coalesce(p_input_url, ''))) < 12 or p_input_url !~* '^https://(www\.)?(x\.com|twitter\.com|linkedin\.com)/') then
    raise exception 'Submit a valid public X or LinkedIn post URL';
  end if;
  result := public.award_points(auth.uid(), rule.quest_id, rule.title, rule.points, rule.stage,
    case when rule.requires_url then 'Self-submitted public post URL; subject to organizer review' else 'Attendee self-reported quest completion' end);
  if result.id is null then raise exception 'Quest was already completed'; end if;
  return result;
end; $$;

-- 6. Connections happen only by scanning in person. make_connection also respects stage 2.
drop function if exists public.request_connection_by_id(uuid);
create or replace function public.request_connection(p_qr_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform public.require_stage_open(2::smallint);
  select id into target_id from public.profiles where qr_token = p_qr_token;
  if target_id is null then raise exception 'Attendee QR is invalid'; end if;
  return public.make_connection(auth.uid(), target_id);
end; $$;

-- 7. Organizer controls.
create or replace function public.staff_set_stage_active(p_stage smallint, p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare stage_name text;
begin
  if not public.is_event_staff() then raise exception 'Organizer authorization required'; end if;
  update public.stage_settings set active = p_active, updated_at = now() where stage = p_stage;
  if not found then raise exception 'Unknown stage'; end if;
  if p_active then
    stage_name := case p_stage when 1 then 'Boot Up' when 2 then 'Plug In' when 3 then 'Prompt Blitz' else 'Industry Integration' end;
    insert into public.notifications (user_id, kind, title, body)
    select id, 'stage', 'Stage ' || p_stage || ' is open: ' || stage_name, 'Head to Home to start.' from public.profiles;
  end if;
end; $$;

create or replace function public.staff_save_quiz_question(p_id uuid, p_sort_order integer, p_topic text, p_question text,
  p_options text[], p_correct_index smallint, p_explanation text, p_active boolean)
returns uuid language plpgsql security definer set search_path = '' as $$
declare saved_id uuid;
begin
  if not public.is_event_staff() then raise exception 'Organizer authorization required'; end if;
  if length(trim(coalesce(p_question, ''))) < 5 or p_options is null or cardinality(p_options) <> 4
     or exists (select 1 from unnest(p_options) o where length(trim(coalesce(o, ''))) = 0)
     or p_correct_index not between 0 and 3 then
    raise exception 'A question needs text, four options and one correct answer';
  end if;
  if p_id is null then
    insert into public.quiz_questions (sort_order, topic, question, options, correct_index, explanation, active)
    values (coalesce(p_sort_order, 0), left(coalesce(p_topic, ''), 80), trim(p_question), p_options, p_correct_index, left(coalesce(p_explanation, ''), 400), coalesce(p_active, true))
    returning id into saved_id;
  else
    update public.quiz_questions set sort_order = coalesce(p_sort_order, sort_order), topic = left(coalesce(p_topic, ''), 80),
      question = trim(p_question), options = p_options, correct_index = p_correct_index,
      explanation = left(coalesce(p_explanation, ''), 400), active = coalesce(p_active, true)
    where id = p_id returning id into saved_id;
    if saved_id is null then raise exception 'Question not found'; end if;
  end if;
  return saved_id;
end; $$;

create or replace function public.staff_delete_quiz_question(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_event_staff() then raise exception 'Organizer authorization required'; end if;
  delete from public.quiz_questions where id = p_id;
end; $$;

grant execute on function public.staff_set_stage_active(smallint, boolean),
  public.staff_save_quiz_question(uuid, integer, text, text, text[], smallint, text, boolean),
  public.staff_delete_quiz_question(uuid) to authenticated;

-- 8. Seed the original ten questions (only when the table is empty). Answer indexes: 2,0,3,1,2,1,3,0,2,3.
insert into public.quiz_questions (sort_order, topic, question, options, correct_index, explanation)
select r.pos, r.topic, r.question, array(select jsonb_array_elements_text(r.options)),
  (string_to_array('2,0,3,1,2,1,3,0,2,3', ','))[r.pos + 1]::smallint, r.explanation
from jsonb_to_recordset($j$[{"pos":0,"question":"How is computer vision currently deployed by agritech startups on the Jos Plateau to protect Irish potato harvests?","options":["Using AI to dig the soil with robotic spoons","Playing classical symphony music to potato roots","Automated early blight detection via drone & smartphone leaf imagery","Watermarking potatoes with NFT barcodes"],"topic":"Plateau Agritech AI","explanation":"Computer vision models trained on local foliage identify early and late blight on potato crops days before visible damage spreads, saving up to 40% of yields."},{"pos":1,"question":"In industrial AI applications, what is the primary role of \"Edge AI\" compared to central Cloud AI?","options":["Processing sensor data directly on venue/factory hardware with zero cloud latency","Storing data on external floppy disks","Sending paper faxes between factory machines","Increasing energy bills unnecessarily"],"topic":"AI x Industry Architecture","explanation":"Edge AI runs neural models directly on gateways and local microcontrollers, guaranteeing real-time safety shutoffs and zero dependency on unstable internet."},{"pos":2,"question":"What technique do modern payment processors use to detect and halt automated credit card fraud in under 100 milliseconds?","options":["Calling each customer on landline before charging","Flipping a coin at checkout","Asking the customer to mail a handwritten signature","Real-time anomaly detection models analyzing velocity and device fingerprints"],"topic":"Fintech Automation","explanation":"Machine learning classifiers analyze hundreds of transaction features within milliseconds to flag suspicious velocity spikes and synthetic identities."},{"pos":3,"question":"Why is Jos, Plateau State historically celebrated as a premier technology talent hub in Nigeria?","options":["Being the only city with access to electricity","Pioneering tech communities (nHub), cooler climate for hardware labs, and high graduate density","Having the world’s largest underwater data cables","Having no competitive developers"],"topic":"Plateau Tech History","explanation":"Jos enjoys a thriving developer ecosystem nurtured since 2015 by nHub, premier universities (UNIJOS, Plateau Poly), and an ideal temperate climate for knowledge work."},{"pos":4,"question":"What does \"Retrieval-Augmented Generation\" (RAG) provide to an enterprise LLM system?","options":["Retraining the entire base model from scratch every evening","Generating random fictional responses for fun","Grounding the model’s answers with private, up-to-date company documents and databases","Translating text into 1990s HTML tags"],"topic":"Generative AI & LLMs","explanation":"RAG retrieves relevant private knowledge chunks from vector databases at query time, drastically reducing hallucinations and keeping responses accurate."},{"pos":5,"question":"In industrial robotics, what is an \"Operator in the Loop\" (HITL) architecture designed to do?","options":["Forcing humans to manually approve every single microsecond calculation","Letting AI handle routine automation while escalating ambiguous edge cases to a human expert","Eliminating all human involvement permanently","Creating an infinite loop that crashes the server"],"topic":"Autonomous Systems","explanation":"Human-in-the-Loop (HITL) automates 95% of routine workflows while giving human operators oversight on high-stakes anomaly exceptions."},{"pos":6,"question":"What is the purpose of \"Quantization\" (e.g. 4-bit or 8-bit) when deploying AI models onto consumer devices?","options":["Multiplying the model size by 10 to fill up storage","Deleting the training weights randomly","Changing the coding language from Python to Fortran","Reducing model memory footprint and compute requirements with minimal accuracy loss"],"topic":"Model Optimization","explanation":"Quantization reduces floating-point precision (FP16/FP32 down to INT8/INT4), enabling LLMs to run smoothly on edge servers and affordable mobile phones."},{"pos":7,"question":"In automated smart manufacturing and mining on the Plateau, what is a \"Digital Twin\"?","options":["A real-time virtual simulation that mirrors physical assets and operational states","An identical twin brother who works as a programmer","A backup copy of Windows 98","A second monitor on your desk"],"topic":"Industrial IoT","explanation":"A Digital Twin is a software representation of physical equipment fed with live IoT sensor telemetry to predict component failure before downtime occurs."},{"pos":8,"question":"Why is collecting local linguistic and cultural datasets critical for Nigerian AI development?","options":["Because global models already speak all local slang perfectly","To sell user phone books to spam marketers","Preventing cultural bias and ensuring AI tools effectively serve indigenous languages like Hausa, Yoruba & Igbo","It has no practical importance"],"topic":"African AI Sovereignty","explanation":"Without local datasets, AI tools fail to understand Nigerian nuances, local trade dialects, and contextual community needs."},{"pos":9,"question":"What distinguishes an \"Autonomous AI Agent\" from a standard chatbot like ChatGPT?","options":["Agents can only reply with emojis","Agents do not use machine learning","Agents can only run when you plug in headphones","Agents can plan multi-step tasks, use external tools/APIs, and execute actions to achieve a goal"],"topic":"Autonomous Agents","explanation":"Autonomous agents evaluate objectives, plan sequences, execute tool calls (e.g., database writes, emails, code runs), and inspect intermediate outputs autonomously."}]$j$::jsonb)
  as r(pos int, question text, options jsonb, topic text, explanation text)
where not exists (select 1 from public.quiz_questions);
