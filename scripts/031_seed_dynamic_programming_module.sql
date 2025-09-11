-- Dynamic Programming module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%dynamic%' OR lower(name) LIKE '%dp%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which DP technique stores solutions to subproblems to avoid recomputation?',
         'multiple_choice',
         'memoization',
         'Memoization caches results of subproblems.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which DP technique stores solutions to subproblems to avoid recomputation?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'memoization')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES('tabulation',1),('greedy caching',2),('memoization',3),('branch and bound',4)
) AS opt(option_text, order_index);

-- Coding: coin change (min coins)
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%dynamic%' OR lower(name) LIKE '%dp%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given coin denominations and total amount, print min number of coins or -1 if impossible.',
       'code_completion',
       'implementation varies',
       'Use classic DP array where dp[x] = min coins to make x.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given coin denominations and total amount, print min number of coins or -1 if impossible.'
);

