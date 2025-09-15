-- Stacks & Queues module seeds (~10 questions) - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)

-- MCQ 1: Stack LIFO
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which property defines a stack?',
         'multiple_choice',
         'LIFO',
         'Stack is Last-In-First-Out.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which property defines a stack?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'LIFO')::boolean, opt.order_index
FROM q1
CROSS JOIN (VALUES ('FIFO',1),('LILO',2),('LIFO',3),('Random',4)) AS opt(option_text, order_index);

-- MCQ 2: Queue FIFO
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
), q2 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which property defines a queue?',
         'multiple_choice',
         'FIFO',
         'Queue is First-In-First-Out.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which property defines a queue?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'FIFO')::boolean, opt.order_index
FROM q2
CROSS JOIN (VALUES ('LIFO',1),('Priority',2),('Round-robin',3),('FIFO',4)) AS opt(option_text, order_index);

-- MCQ 3: Stack ops complexity
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
), q3 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Time complexity of push/pop on an array-backed stack (amortized)?',
         'multiple_choice',
         'O(1)',
         'Amortized O(1) for push/pop on dynamic array.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Time complexity of push/pop on an array-backed stack (amortized)?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'O(1)')::boolean, opt.order_index
FROM q3
CROSS JOIN (VALUES ('O(n)',1),('O(log n)',2),('O(1)',3),('O(n log n)',4)) AS opt(option_text, order_index);

-- MCQ 4: Queue ops
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
), q4 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which pair are fundamental queue operations?',
         'multiple_choice',
         'enqueue/dequeue',
         'Enqueue adds to back; dequeue removes from front.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which pair are fundamental queue operations?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'enqueue/dequeue')::boolean, opt.order_index
FROM q4
CROSS JOIN (VALUES ('push/pop',1),('insert/delete',2),('enqueue/dequeue',3),('offer/poll only',4)) AS opt(option_text, order_index);

-- MCQ 5: Use of stack
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
), q5 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which problem is naturally solved with a stack?',
         'multiple_choice',
         'parentheses matching',
         'Use stack to track opening symbols.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which problem is naturally solved with a stack?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'parentheses matching')::boolean, opt.order_index
FROM q5
CROSS JOIN (VALUES ('bfs traversal',1),('dijkstra',2),('parentheses matching',3),('hashing',4)) AS opt(option_text, order_index);

-- MCQ 6: Use of queue
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
), q6 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which use-case fits a queue best?',
         'multiple_choice',
         'BFS frontier',
         'Breadth-first search uses a queue for its frontier.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which use-case fits a queue best?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'BFS frontier')::boolean, opt.order_index
FROM q6
CROSS JOIN (VALUES ('dfs recursion',1),('BFS frontier',2),('heap scheduling',3),('union-find',4)) AS opt(option_text, order_index);

-- MCQ 7: Deque
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
), q7 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'A deque supports which ends for insertion/removal?',
         'multiple_choice',
         'both front and back',
         'Double-ended queue.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'A deque supports which ends for insertion/removal?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'both front and back')::boolean, opt.order_index
FROM q7
CROSS JOIN (VALUES ('front only',1),('back only',2),('both front and back',3),('neither',4)) AS opt(option_text, order_index);

-- Coding 1: Parentheses validity
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given a string of brackets ()[]{}, print true if valid, else false.',
       'code_completion',
       'implementation varies',
       'Use stack to push openings and match closings.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       3
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given a string of brackets ()[]{}, print true if valid, else false.'
);

-- Coding 2: Implement queue with two stacks (operations)
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Implement a queue with two stacks. Process q operations: push x / pop and print popped values.',
       'code_completion',
       'implementation varies',
       'Maintain in/out stacks; shift when needed.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Implement a queue with two stacks. Process q operations: push x / pop and print popped values.'
);

-- Coding 3: Sliding window max with deque
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%stack%' OR lower(name) LIKE '%queue%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Given array and window k, print sliding window maximums using a deque.',
       'code_completion',
       'implementation varies',
       'Use deque to keep decreasing indices; pop front when out of window.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       5
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Given array and window k, print sliding window maximums using a deque.'
);


