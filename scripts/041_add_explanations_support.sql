-- Explanations Support (idempotent)
-- - Adds explanation_feedback table (optional FK to questions/users)
-- - Ensures explanation columns exist on questions/problems
-- - Seeds default explanations where missing (MCQ)

begin;

-- Ensure explanation columns exist
alter table if exists public.questions
  add column if not exists explanation text;

alter table if exists public.problems
  add column if not exists explanation text;

-- Create feedback table if not exists
create table if not exists public.explanation_feedback (
  id uuid primary key default gen_random_uuid(),
  question_id uuid null,
  user_id uuid null,
  is_helpful boolean not null default false,
  notes text null,
  created_at timestamptz not null default now()
);

-- Add indexes (safe to re-run)
create index if not exists idx_expl_fb_question on public.explanation_feedback (question_id);
create index if not exists idx_expl_fb_user on public.explanation_feedback (user_id);
create index if not exists idx_expl_fb_created on public.explanation_feedback (created_at);

-- Try to attach foreign keys if referenced tables exist
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'questions') then
    if not exists (
      select 1 from pg_constraint where conname = 'explanation_feedback_question_fk'
    ) then
      alter table public.explanation_feedback
        add constraint explanation_feedback_question_fk
        foreign key (question_id) references public.questions(id) on delete set null;
    end if;
  end if;
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'users') then
    if not exists (
      select 1 from pg_constraint where conname = 'explanation_feedback_user_fk'
    ) then
      alter table public.explanation_feedback
        add constraint explanation_feedback_user_fk
        foreign key (user_id) references public.users(id) on delete set null;
    end if;
  end if;
exception when others then
  -- Avoid breaking idempotency if FKs already exist with different names
  null;
end$$;

-- Seed default explanations for MCQs where missing using the correct option
-- (Safe and idempotent: only fills when explanation is null)
with correct_opts as (
  select q.id as question_id,
         (select option_text from public.question_options o
           where o.question_id = q.id and coalesce(o.is_correct, false) = true
           order by coalesce(o.order_index, 0)
           limit 1) as correct_text
  from public.questions q
)
update public.questions q
set explanation = concat(
  'Why this is correct:\n- This option matches the core concept being tested.\n\n',
  'Correct answer: ', coalesce(c.correct_text, 'N/A'), '\n\n',
  'How to reason next time:\n- Identify the concept first, then eliminate contradicting choices.'
)
from correct_opts c
where q.id = c.question_id
  and q.explanation is null
  and c.correct_text is not null;

commit;


