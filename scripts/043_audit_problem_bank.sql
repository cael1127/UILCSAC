-- Audit: Problem Bank Coverage & Quality
-- Safe read-only checks

-- 1) Problems without any test cases
select p.id, p.title, p.category, p.difficulty_level
from public.problems p
left join (
  select problem_id, count(*) as tc
  from public.test_cases
  group by problem_id
) t on t.problem_id = p.id
where coalesce(p.is_active, true) = true
  and coalesce(t.tc, 0) = 0
order by p.created_at desc nulls last;

-- 2) Test case counts per problem
select p.id, p.title, count(t.id) as test_cases
from public.problems p
left join public.test_cases t on t.problem_id = p.id
where coalesce(p.is_active, true) = true
group by p.id, p.title
order by test_cases asc, p.title;

-- 3) Problems missing explanation text
select p.id, p.title
from public.problems p
where coalesce(p.is_active, true) = true
  and (p.explanation is null or length(trim(p.explanation)) = 0)
order by p.created_at desc nulls last;


