-- Purge starter/placeholder/sample questions across all modules
-- Idempotent and conservative: targets common placeholder patterns only
-- Run in Supabase SQL editor. Review the DRY RUN query first if desired.

-- DRY RUN (uncomment to preview candidates)
-- WITH candidates AS (
--   SELECT q.id, q.module_id, q.question_text, q.question_type
--   FROM questions q
--   LEFT JOIN LATERAL (
--     SELECT array_agg(lower(trim(o.option_text)) ORDER BY lower(trim(o.option_text))) AS opts
--     FROM question_options o WHERE o.question_id = q.id
--   ) opt ON TRUE
--   WHERE
--     -- Text-based patterns
--     lower(q.question_text) LIKE 'which concept best relates to this module:%'
--     OR lower(q.question_text) LIKE 'complete the code snippet relevant to:%'
--     OR lower(q.question_text) LIKE '%sample question%'
--     OR lower(q.question_text) LIKE '%starter question%'
--     OR lower(coalesce(q.explanation, '')) LIKE '%checks basic understanding of the module topic%'
--     OR lower(coalesce(q.explanation, '')) LIKE '%students should write a minimal correct snippet%'
--     -- Generic A/B/C/D options only
--     OR (
--       q.question_type = 'multiple_choice' AND
--       opt.opts IS NOT NULL AND (
--         opt.opts = ARRAY['a','b','c','d']::text[] OR
--         opt.opts = ARRAY['option a','option b','option c','option d']::text[]
--       )
--     )
-- )
-- SELECT * FROM candidates;

-- Remove dependent responses first (if exists)
WITH candidates AS (
  SELECT q.id
  FROM questions q
  LEFT JOIN LATERAL (
    SELECT array_agg(lower(trim(o.option_text)) ORDER BY lower(trim(o.option_text))) AS opts
    FROM question_options o WHERE o.question_id = q.id
  ) opt ON TRUE
  WHERE
    lower(q.question_text) LIKE 'which concept best relates to this module:%'
    OR lower(q.question_text) LIKE 'complete the code snippet relevant to:%'
    OR lower(q.question_text) LIKE '%sample question%'
    OR lower(q.question_text) LIKE '%starter question%'
    OR lower(coalesce(q.explanation, '')) LIKE '%checks basic understanding of the module topic%'
    OR lower(coalesce(q.explanation, '')) LIKE '%students should write a minimal correct snippet%'
    OR (
      q.question_type = 'multiple_choice' AND
      opt.opts IS NOT NULL AND (
        opt.opts = ARRAY['a','b','c','d']::text[] OR
        opt.opts = ARRAY['option a','option b','option c','option d']::text[]
      )
    )
)
DELETE FROM user_question_responses r
USING candidates c
WHERE r.question_id = c.id;

-- Delete the placeholder questions (question_options will cascade)
WITH candidates AS (
  SELECT q.id
  FROM questions q
  LEFT JOIN LATERAL (
    SELECT array_agg(lower(trim(o.option_text)) ORDER BY lower(trim(o.option_text))) AS opts
    FROM question_options o WHERE o.question_id = q.id
  ) opt ON TRUE
  WHERE
    lower(q.question_text) LIKE 'which concept best relates to this module:%'
    OR lower(q.question_text) LIKE 'complete the code snippet relevant to:%'
    OR lower(q.question_text) LIKE '%sample question%'
    OR lower(q.question_text) LIKE '%starter question%'
    OR lower(coalesce(q.explanation, '')) LIKE '%checks basic understanding of the module topic%'
    OR lower(coalesce(q.explanation, '')) LIKE '%students should write a minimal correct snippet%'
    OR (
      q.question_type = 'multiple_choice' AND
      opt.opts IS NOT NULL AND (
        opt.opts = ARRAY['a','b','c','d']::text[] OR
        opt.opts = ARRAY['option a','option b','option c','option d']::text[]
      )
    )
)
DELETE FROM questions q
USING candidates c
WHERE q.id = c.id;

-- Optional: report how many were removed (works in psql; Supabase UI shows row counts)
-- SELECT count(*) FROM candidates;


