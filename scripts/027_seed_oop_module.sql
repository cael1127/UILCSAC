-- OOP module seeds - idempotent

WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%object%' OR lower(name) LIKE '%oop%'
)
, q1 AS (
  INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
  SELECT m.id,
         'Which OOP principle allows treating subclasses as instances of their superclass?',
         'multiple_choice',
         'polymorphism',
         'Polymorphism enables a single interface with many implementations.',
         COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
         2
  FROM mod m
  WHERE NOT EXISTS (
    SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Which OOP principle allows treating subclasses as instances of their superclass?'
  )
  RETURNING id
)
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT id, opt.option_text, (opt.option_text = 'polymorphism')::boolean, opt.order_index
FROM q1
CROSS JOIN (
  VALUES
    ('encapsulation',1),
    ('inheritance',2),
    ('polymorphism',3),
    ('abstraction',4)
) AS opt(option_text, order_index);

-- Coding: design a class hierarchy and compute area
WITH mod AS (
  SELECT id FROM path_modules WHERE lower(name) LIKE '%object%' OR lower(name) LIKE '%oop%'
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points)
SELECT m.id,
       'Design classes Circle and Rectangle implementing a Shape interface with area(). Read shape type and parameters; print area.',
       'code_completion',
       'implementation varies',
       'Use interfaces/abstract classes and method overriding.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = m.id), 0) + 1,
       4
FROM mod m
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.module_id = m.id AND q.question_text = 'Design classes Circle and Rectangle implementing a Shape interface with area(). Read shape type and parameters; print area.'
);

