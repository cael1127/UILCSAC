-- Audit: Learning Modules Coverage & Health
-- Safe read-only checks to verify content completeness

-- 1) Modules with zero active questions
select m.id as module_id, m.learning_path_id, m.name, m.order_index
from public.path_modules m
left join (
  select module_id, count(*) as q_count
  from public.questions
  where coalesce(is_active, true) = true
  group by module_id
) q on q.module_id = m.id
where coalesce(m.is_active, true) = true
  and coalesce(q.q_count, 0) = 0
order by m.learning_path_id, m.order_index;

-- 2) Question counts per module
select m.learning_path_id, m.id as module_id, m.name, count(q.id) as questions
from public.path_modules m
left join public.questions q on q.module_id = m.id and coalesce(q.is_active, true) = true
where coalesce(m.is_active, true) = true
group by m.learning_path_id, m.id, m.name
order by m.learning_path_id, m.order_index;

-- 3) Paths summary: modules and questions per path
select lp.id as learning_path_id, lp.name,
       count(distinct m.id) as modules,
       count(q.id) as questions
from public.learning_paths lp
left join public.path_modules m on m.learning_path_id = lp.id and coalesce(m.is_active, true) = true
left join public.questions q on q.module_id = m.id and coalesce(q.is_active, true) = true
where coalesce(lp.is_active, true) = true
group by lp.id, lp.name
order by lp.name;

-- 4) Questions missing explanation text
select q.id as question_id, q.module_id, m.name as module_name
from public.questions q
left join public.path_modules m on m.id = q.module_id
where coalesce(q.is_active, true) = true
  and (q.explanation is null or length(trim(q.explanation)) = 0)
order by q.module_id, q.order_index;


