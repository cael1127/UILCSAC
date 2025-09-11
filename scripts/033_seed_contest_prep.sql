-- Contest Prep module seeds - mixed topics, idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%contest%' OR lower(name) LIKE '%prep%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Given constraints up to 1e5 operations, which complexity per operation is generally safe?',
         'multiple_choice',
         'O(log n)',
         'For 1e5 operations, O(log n) is typically safe in time limits.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given constraints up to 1e5 operations, which complexity per operation is generally safe?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'O(log n)')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES('O(n^2)',1),('O(n)',2),('O(log n)',3),('O(n log n)',4)
) AS opt(option_text, order_index);

-- Coding: Fast I/O and problem skeleton
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%contest%' OR lower(name) LIKE '%prep%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read input quickly and process T independent test cases (print sum for each).',
       'code_completion',
       'implementation varies',
       'Use buffered I/O or Scanner optimization and loop over T cases.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read input quickly and process T independent test cases (print sum for each).'
);

