-- Arrays & Collections module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%array%' OR lower(name) LIKE '%collection%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which structure offers O(1) average-time lookup by key?',
         'multiple_choice',
         'HashMap',
         'HashMap offers expected O(1) average operations.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which structure offers O(1) average-time lookup by key?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id,
       opt.option_text,
       (opt.option_text = 'HashMap')::boolean,
       opt.order_index
FROM q1
CROSS JOIN (
  VALUES
    ('ArrayList',1),
    ('LinkedList',2),
    ('HashMap',3),
    ('TreeMap',4)
) AS opt(option_text, order_index);

-- Coding: rotate array right by k
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%array%' OR lower(name) LIKE '%collection%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n, array, and k; rotate the array right by k and print space-separated.',
       'code_completion',
       'implementation varies',
       'Use reverse or extra array to rotate.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n, array, and k; rotate the array right by k and print space-separated.'
);

