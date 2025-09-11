-- Purpose: Seed Simulation Problems module with substantive questions (MCQ + coding)
-- Idempotent via NOT EXISTS guards

-- 1) Find Simulation module ids
WITH sim_modules AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%simulation%'
)
-- 2) MCQ: Event queue semantics
, mcq AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT sm.id,
         'In a discrete-event simulation, which data structure best models future events?',
         'multiple_choice',
         'priority_queue',
         'Future events are typically scheduled based on time; a min-heap/priority queue retrieves the next event.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = sm.id), 0) + 1,
         2
  FROM sim_modules sm
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = sm.id AND q.question_text = 'In a discrete-event simulation, which data structure best models future events?'
  )
  RETURNING id, module_id, order_index
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id,
       opt.option_text,
       (opt.option_text = 'priority_queue')::boolean,
       opt.order_index
FROM mcq
CROSS JOIN (
  VALUES
    ('stack', 1),
    ('queue', 2),
    ('priority_queue', 3),
    ('deque', 4)
) AS opt(option_text, order_index);

-- 3) Coding: simulate elevator movement
WITH sim_modules AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%simulation%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT sm.id,
       'Write a program to simulate a single-elevator system processing floor requests (up/down). Output final floor.',
       'code_completion',
       'implementation varies',
       'Track state (current floor, direction) and process requests in order received.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = sm.id), 0) + 1,
       3
FROM sim_modules sm
WHERE NOT EXISTS (
  SELECT 1 FROM questions q
  WHERE q.module_id = sm.id AND q.question_text = 'Write a program to simulate a single-elevator system processing floor requests (up/down). Output final floor.'
);

-- Note: Does not modify users or prior data.

