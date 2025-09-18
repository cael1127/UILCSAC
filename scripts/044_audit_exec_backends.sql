-- Audit: Execution Backends Logs (code_executions)
-- Safe read-only checks

-- 1) Recent executions summary
select date_trunc('day', created_at) as day,
       count(*) as total,
       sum(case when success then 1 else 0 end) as successes,
       sum(case when not success then 1 else 0 end) as failures
from public.code_executions
group by 1
order by 1 desc
limit 14;

-- 2) Failures by error message (top 10)
select coalesce(error, 'unknown') as error, count(*)
from public.code_executions
where success = false
group by 1
order by count(*) desc
limit 10;

-- 3) Average execution time by environment
select coalesce(environment, 'unknown') as env,
       round(avg(nullif(execution_time, 0))) as avg_ms,
       count(*) as runs
from public.code_executions
group by 1
order by runs desc;


