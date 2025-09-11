-- Trees & Graphs module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%tree%' OR lower(name) LIKE '%graph%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which traversal visits root, then left subtree, then right subtree?',
         'multiple_choice',
         'preorder',
         'Preorder: root-left-right.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which traversal visits root, then left subtree, then right subtree?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'preorder')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES('inorder',1),('postorder',2),('preorder',3),('level order',4)
) AS opt(option_text, order_index);

-- Coding: BFS shortest path on unweighted graph
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%tree%' OR lower(name) LIKE '%graph%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given n, m and m edges of an undirected graph, and s,t; print length of shortest path (BFS).',
       'code_completion',
       'implementation varies',
       'Use BFS from s; track distances; print distance to t or -1.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given n, m and m edges of an undirected graph, and s,t; print length of shortest path (BFS).'
);

