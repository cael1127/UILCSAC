-- Java Basics & Syntax module seeds (MCQs + coding) - idempotent

WITH basics AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%java basics%' OR lower(name) LIKE '%basics%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT b.id,
         'What is the default value of an uninitialized int field in a class?',
         'multiple_choice',
         '0',
         'Primitive int fields default to 0.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = b.id), 0) + 1,
         2
  FROM basics b
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = b.id AND q.question_text = 'What is the default value of an uninitialized int field in a class?'
  )
  RETURNING id, module_id, order_index
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id,
       opt.option_text,
       (opt.option_text = '0')::boolean,
       opt.order_index
FROM q1
CROSS JOIN (
  VALUES
    ('null', 1),
    ('0', 2),
    ('undefined', 3),
    ('1', 4)
) AS opt(option_text, order_index);

WITH basics AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%java basics%' OR lower(name) LIKE '%basics%'
)
, q2 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT b.id,
         'Which keyword creates a new object instance?',
         'multiple_choice',
         'new',
         'The new keyword allocates memory and returns a reference.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = b.id), 0) + 1,
         2
  FROM basics b
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = b.id AND q.question_text = 'Which keyword creates a new object instance?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id,
       opt.option_text,
       (opt.option_text = 'new')::boolean,
       opt.order_index
FROM q2
CROSS JOIN (
  VALUES
    ('alloc', 1),
    ('create', 2),
    ('new', 3),
    ('make', 4)
) AS opt(option_text, order_index);

-- Coding: parse integers and sum
WITH basics AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%java basics%' OR lower(name) LIKE '%basics%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT b.id,
       'Read n followed by n integers and print their sum.',
       'code_completion',
       'implementation varies',
       'Use Scanner to read input and loop to accumulate the sum.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = b.id), 0) + 1,
       3
FROM basics b
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = b.id AND q.question_text = 'Read n followed by n integers and print their sum.'
);


