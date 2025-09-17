-- Replace code-writing questions with reading-code (predict output) MCQs
-- Safe, idempotent-ish: avoids duplicates via NOT EXISTS guards
-- Run in Supabase SQL Editor after seeding

BEGIN;

-- 1) Remove user responses tied to code-writing questions
DELETE FROM user_question_responses r
USING questions q
WHERE r.question_id = q.id
  AND q.question_type IN ('code_completion', 'written_response');

-- 2) Delete code-writing questions (options cascade via FK)
DELETE FROM questions q
WHERE q.question_type IN ('code_completion', 'written_response');

-- 3) Ensure each module has at least 3 reading-code MCQs
--    We will insert up to three standard MCQs per module if missing.

WITH mcq_counts AS (
  SELECT pm.id AS module_id,
         COALESCE(COUNT(q.id), 0) AS mcq_count
  FROM path_modules pm
  LEFT JOIN questions q
    ON q.module_id = pm.id AND q.question_type = 'multiple_choice' AND q.is_active = true
  GROUP BY pm.id
),
targets AS (
  -- Calculate how many to add per module (to reach 3)
  SELECT module_id, GREATEST(0, 3 - mcq_count) AS to_add
  FROM mcq_counts
)
-- Insert Reading Code MCQ #1 where needed
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points, is_active)
SELECT t.module_id,
       'What is the output of: int x = 5; int y = x++ + ++x; System.out.println(y);',
       'multiple_choice',
       '12',
       'x++ returns 5 then increments to 6, ++x increments to 7 then returns 7. So y = 5 + 7 = 12.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = t.module_id), 0) + 1,
       2,
       true
FROM targets t
WHERE t.to_add > 0
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = t.module_id
      AND q.question_text = 'What is the output of: int x = 5; int y = x++ + ++x; System.out.println(y);'
  );

-- Options for MCQ #1
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT q.id, o.option_text, (o.option_text = '12')::boolean, o.order_index
FROM (
  SELECT id FROM questions
  WHERE question_text = 'What is the output of: int x = 5; int y = x++ + ++x; System.out.println(y);'
) q
CROSS JOIN (
  VALUES ('12',1),('10',2),('11',3),('13',4)
) AS o(option_text, order_index);

-- Insert Reading Code MCQ #2 where still needed
WITH mcq_counts AS (
  SELECT pm.id AS module_id,
         COALESCE(COUNT(q.id), 0) AS mcq_count
  FROM path_modules pm
  LEFT JOIN questions q
    ON q.module_id = pm.id AND q.question_type = 'multiple_choice' AND q.is_active = true
  GROUP BY pm.id
),
targets AS (
  SELECT module_id, GREATEST(0, 3 - mcq_count) AS to_add
  FROM mcq_counts
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points, is_active)
SELECT t.module_id,
       'What is the output of: for (int i = 0; i < 3; i++) { if (i == 1) continue; System.out.print(i); }',
       'multiple_choice',
       '02',
       'Loop prints 0, skips 1 due to continue, then prints 2.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = t.module_id), 0) + 1,
       2,
       true
FROM targets t
WHERE t.to_add > 1
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = t.module_id
      AND q.question_text = 'What is the output of: for (int i = 0; i < 3; i++) { if (i == 1) continue; System.out.print(i); }'
  );

INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT q.id, o.option_text, (o.option_text = '02')::boolean, o.order_index
FROM (
  SELECT id FROM questions
  WHERE question_text = 'What is the output of: for (int i = 0; i < 3; i++) { if (i == 1) continue; System.out.print(i); }'
) q
CROSS JOIN (
  VALUES ('02',1),('012',2),('20',3),('0 1 2',4)
) AS o(option_text, order_index);

-- Insert Reading Code MCQ #3 where still needed
WITH mcq_counts AS (
  SELECT pm.id AS module_id,
         COALESCE(COUNT(q.id), 0) AS mcq_count
  FROM path_modules pm
  LEFT JOIN questions q
    ON q.module_id = pm.id AND q.question_type = 'multiple_choice' AND q.is_active = true
  GROUP BY pm.id
),
targets AS (
  SELECT module_id, GREATEST(0, 3 - mcq_count) AS to_add
  FROM mcq_counts
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points, is_active)
SELECT t.module_id,
       'What is the output of: String s = "Hello"; System.out.println(s.indexOf("l"));',
       'multiple_choice',
       '2',
       'indexOf returns the first occurrence position of "l", which is 2.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = t.module_id), 0) + 1,
       2,
       true
FROM targets t
WHERE t.to_add > 2
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = t.module_id
      AND q.question_text = 'What is the output of: String s = "Hello"; System.out.println(s.indexOf("l"));'
  );

INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT q.id, o.option_text, (o.option_text = '2')::boolean, o.order_index
FROM (
  SELECT id FROM questions
  WHERE question_text = 'What is the output of: String s = "Hello"; System.out.println(s.indexOf("l"));'
) q
CROSS JOIN (
  VALUES ('2',1),('1',2),('3',3),('-1',4)
) AS o(option_text, order_index);

COMMIT;


