-- Advanced Data Structures module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%advanced data%' OR lower(name) LIKE '%heaps%' OR lower(name) LIKE '%trees%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which data structure supports extract-min in O(log n)?',
         'multiple_choice',
         'min-heap',
         'A binary min-heap provides O(log n) extract-min.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         3
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which data structure supports extract-min in O(log n)?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'min-heap')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES('stack',1),('queue',2),('min-heap',3),('hash table',4)
) AS opt(option_text, order_index);

-- Coding: Implement a min-heap operations subset
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%advanced data%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Read q operations (push x / pop). Maintain a min-heap and print popped values.',
       'code_completion',
       'implementation varies',
       'Use priority queue / heap structure; handle underflow.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       5
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Read q operations (push x / pop). Maintain a min-heap and print popped values.'
);

