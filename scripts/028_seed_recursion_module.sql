-- Recursion module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%recursion%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'What is the base case in a recursive factorial function for n?',
         'multiple_choice',
         'n == 0',
         'Commonly factorial(0) = 1; base case checks n==0.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'What is the base case in a recursive factorial function for n?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'n == 0')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES('n == 0',1),('n == 1',2),('n < 0',3),('n > 1',4)
) AS opt(option_text, order_index);

-- Coding: compute nth Fibonacci (recursive with memo or iterative)
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%recursion%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read n and print the nth Fibonacci number.',
       'code_completion',
       'implementation varies',
       'Demonstrate recursion + memoization or an iterative approach.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read n and print the nth Fibonacci number.'
);

