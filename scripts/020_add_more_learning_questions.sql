-- Purpose: Add more questions to every existing learning module without touching users or existing data
-- Safe to run multiple times: guarded with WHERE NOT EXISTS on (module_id, question_text)

-- 1) Add one conceptual MCQ per module
WITH new_q AS (
  INSERT INTO questions (
    module_id,
    question_text,
    question_type,
    correct_answer,
    explanation,
    order_index,
    points
  )
  SELECT
    pm.id AS module_id,
    'Which concept best relates to this module: ' || pm.name || '?' AS question_text,
    'multiple_choice' AS question_type,
    'A' AS correct_answer,
    'This checks basic understanding of the module topic.' AS explanation,
    -- place new questions after existing ones
    COALESCE((SELECT MAX(q.order_index) FROM questions q WHERE q.module_id = pm.id), 0) + 1 AS order_index,
    2 AS points
  FROM path_modules pm
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = pm.id
      AND q.question_text = 'Which concept best relates to this module: ' || pm.name || '?'
  )
  RETURNING id, module_id, order_index
)
-- 2) Options for the inserted questions
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, opt.is_correct, opt.order_index
FROM new_q nq
CROSS JOIN (
  VALUES
    ('A', true, 1),
    ('B', false, 2),
    ('C', false, 3),
    ('D', false, 4)
) AS opt(option_text, is_correct, order_index);

-- 3) Add one code-completion style question per module
WITH new_q2 AS (
  INSERT INTO questions (
    module_id,
    question_text,
    question_type,
    correct_answer,
    explanation,
    order_index,
    points
  )
  SELECT
    pm.id,
    'Complete the code snippet relevant to: ' || pm.name AS question_text,
    'code_completion',
    'implementation varies',
    'Students should write a minimal correct snippet (pseudo acceptable).',
    COALESCE((SELECT MAX(q.order_index) FROM questions q WHERE q.module_id = pm.id), 0) + 1,
    3
  FROM path_modules pm
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = pm.id
      AND q.question_text = 'Complete the code snippet relevant to: ' || pm.name
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, 'Answer will be reviewed', true, 1
FROM new_q2;

-- Note: This script only inserts; it does not modify or delete any users or prior data.

