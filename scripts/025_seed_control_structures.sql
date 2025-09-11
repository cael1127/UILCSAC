-- Control Structures module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%control%' OR lower(name) LIKE '%loops%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'How many times does a for (int i=0; i<5; i++) loop run?',
         'multiple_choice',
         '5',
         'i = 0,1,2,3,4 → 5 times.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'How many times does a for (int i=0; i<5; i++) loop run?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id,
       opt.option_text,
       (opt.option_text = '5')::boolean,
       opt.order_index
FROM q1
CROSS JOIN (
  VALUES
    ('4',1),
    ('5',2),
    ('6',3),
    ('0',4)
) AS opt(option_text, order_index);

-- Coding: count evens in input list
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%control%' OR lower(name) LIKE '%loops%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n then n integers; print how many are even.',
       'code_completion',
       'implementation varies',
       'Use modulo and loop to count.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n then n integers; print how many are even.'
);

