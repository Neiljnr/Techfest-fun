-- Expand Prompt Blitz from ten to fifteen server-scored questions.
-- Fixed IDs make this data migration safe to reapply without duplicate rows.
insert into public.quiz_questions
  (id, sort_order, topic, question, options, correct_index, explanation, active)
values
  ('c94d61a8-6f0a-45ee-a09e-260000000011', 10, 'Responsible AI',
   'Why should a high-impact AI workflow include human review for uncertain cases?',
   array['To make every decision slower, even when the result is clear', 'To review consequential or uncertain decisions and give people a path to appeal', 'To remove the need to measure model performance', 'To let the model collect any data it wants'],
   1, 'Human review adds accountability where mistakes can have serious consequences, and gives people a way to challenge decisions.', true),
  ('c94d61a8-6f0a-45ee-a09e-260000000012', 11, 'Cybersecurity',
   'How does multi-factor authentication help protect an account if its password is stolen?',
   array['It asks for another proof of identity, such as an authenticator code or security key', 'It makes the stolen password expire on every website', 'It hides the account from the internet', 'It automatically reverses any fraudulent payment'],
   0, 'A second, separate proof of identity makes a stolen password alone less likely to be enough to access the account.', true),
  ('c94d61a8-6f0a-45ee-a09e-260000000013', 12, 'Prompt Design',
   'Which instruction is most likely to produce a useful, consistent AI response?',
   array['Tell the model to guess what you need', 'Repeat the same request several times', 'State the goal, relevant context, constraints, and desired output format', 'Remove all context so the prompt is shorter'],
   2, 'A clear goal, context, constraints, and output format give the model a practical target to follow.', true),
  ('c94d61a8-6f0a-45ee-a09e-260000000014', 13, 'Reliable Fintech',
   'A payment request times out, so an app retries it. What does an idempotency key help prevent?',
   array['The payment being processed twice for the same request', 'The customer seeing the payment receipt', 'The bank applying exchange rates', 'The app encrypting its network connection'],
   0, 'An idempotency key lets a payment service recognize a retry as the same request and avoid charging twice.', true),
  ('c94d61a8-6f0a-45ee-a09e-260000000015', 14, 'Data Privacy',
   'What does data minimization mean when building a digital service?',
   array['Collect and keep only the personal data needed for the stated purpose', 'Collect every available detail in case it becomes useful later', 'Keep personal data forever to simplify future updates', 'Share user records with every connected service by default'],
   0, 'Data minimization reduces privacy risk by limiting collection and retention to what the service actually needs.', true)
on conflict (id) do nothing;
