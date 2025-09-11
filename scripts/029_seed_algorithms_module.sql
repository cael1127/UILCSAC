-- Algorithms (sorting/searching) module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%algorithm%' OR lower(name) LIKE '%sorting%' OR lower(name) LIKE '%search%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which sort algorithm has O(n log n) average time and is not stable by default?',
         'multiple_choice',
         'quicksort',
         'Quicksort average time O(n log n), typically not stable.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which sort algorithm has O(n log n) average time and is not stable by default?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'quicksort')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES('mergesort',1),('heapsort',2),('quicksort',3),('bubblesort',4)
) AS opt(option_text, order_index);

-- Coding: binary search (iterative)
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%algorithm%' OR lower(name) LIKE '%sorting%' OR lower(name) LIKE '%search%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n, sorted array, and target; print index via binary search or -1.',
       'code_completion',
       'implementation varies',
       'Use standard binary search template.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n, sorted array, and target; print index via binary search or -1.'
);

