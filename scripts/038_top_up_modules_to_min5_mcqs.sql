-- Ensure every module has at least 5 multiple-choice questions (MCQs)
-- Inserts up to three additional "read the code, predict the output" MCQs per module
-- Safe-ish: Uses NOT EXISTS to avoid duplicates and preserves existing order

BEGIN;

-- Helper: count existing active MCQs per module
WITH mcq_counts AS (
  SELECT pm.id AS module_id,
         COALESCE(COUNT(q.id), 0) AS mcq_count
  FROM path_modules pm
  LEFT JOIN questions q
    ON q.module_id = pm.id AND q.question_type = 'multiple_choice' AND q.is_active = true
  GROUP BY pm.id
), targets AS (
  SELECT module_id, GREATEST(0, 5 - mcq_count) AS to_add
  FROM mcq_counts
)

-- Add MCQ #A where needed
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points, is_active)
SELECT t.module_id,
       'What is the output of: int[] a={1,2,3}; System.out.println(a[0] + a[2]);',
       'multiple_choice',
       '4',
       'a[0] is 1 and a[2] is 3; 1 + 3 = 4.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = t.module_id), 0) + 1,
       2,
       true
FROM targets t
WHERE t.to_add > 0
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = t.module_id
      AND q.question_text = 'What is the output of: int[] a={1,2,3}; System.out.println(a[0] + a[2]);'
  );

INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT q.id, o.option_text, (o.option_text = '4')::boolean, o.order_index
FROM (
  SELECT id FROM questions
  WHERE question_text = 'What is the output of: int[] a={1,2,3}; System.out.println(a[0] + a[2]);'
) q
CROSS JOIN (
  VALUES ('3',1),('4',2),('5',3),('13',4)
) AS o(option_text, order_index);

-- Recompute targets and add MCQ #B
WITH mcq_counts AS (
  SELECT pm.id AS module_id,
         COALESCE(COUNT(q.id), 0) AS mcq_count
  FROM path_modules pm
  LEFT JOIN questions q
    ON q.module_id = pm.id AND q.question_type = 'multiple_choice' AND q.is_active = true
  GROUP BY pm.id
), targets AS (
  SELECT module_id, GREATEST(0, 5 - mcq_count) AS to_add
  FROM mcq_counts
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points, is_active)
SELECT t.module_id,
       'What is the output of: String s="aba"; System.out.println(s.replace("a","b"));',
       'multiple_choice',
       'bbb',
       'All occurrences of "a" are replaced with "b" in "aba" -> "bbb".',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = t.module_id), 0) + 1,
       2,
       true
FROM targets t
WHERE t.to_add > 0
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = t.module_id
      AND q.question_text = 'What is the output of: String s="aba"; System.out.println(s.replace("a","b"));'
  );

INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT q.id, o.option_text, (o.option_text = 'bbb')::boolean, o.order_index
FROM (
  SELECT id FROM questions
  WHERE question_text = 'What is the output of: String s="aba"; System.out.println(s.replace("a","b"));'
) q
CROSS JOIN (
  VALUES ('aba',1),('abb',2),('bbb',3),('bba',4)
) AS o(option_text, order_index);

-- Recompute targets and add MCQ #C
WITH mcq_counts AS (
  SELECT pm.id AS module_id,
         COALESCE(COUNT(q.id), 0) AS mcq_count
  FROM path_modules pm
  LEFT JOIN questions q
    ON q.module_id = pm.id AND q.question_type = 'multiple_choice' AND q.is_active = true
  GROUP BY pm.id
), targets AS (
  SELECT module_id, GREATEST(0, 5 - mcq_count) AS to_add
  FROM mcq_counts
)
INSERT INTO questions (module_id, question_text, question_type, correct_answer, explanation, order_index, points, is_active)
SELECT t.module_id,
       'What is the output of: int x=1; for(int i=0;i<3;i++){ x*=2; } System.out.println(x);',
       'multiple_choice',
       '8',
       'x doubles three times: 1→2→4→8.',
       COALESCE((SELECT MAX(order_index) FROM questions q WHERE q.module_id = t.module_id), 0) + 1,
       2,
       true
FROM targets t
WHERE t.to_add > 0
  AND NOT EXISTS (
    SELECT 1 FROM questions q
    WHERE q.module_id = t.module_id
      AND q.question_text = 'What is the output of: int x=1; for(int i=0;i<3;i++){ x*=2; } System.out.println(x);'
  );

INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT q.id, o.option_text, (o.option_text = '8')::boolean, o.order_index
FROM (
  SELECT id FROM questions
  WHERE question_text = 'What is the output of: int x=1; for(int i=0;i<3;i++){ x*=2; } System.out.println(x);'
) q
CROSS JOIN (
  VALUES ('6',1),('7',2),('8',3),('9',4)
) AS o(option_text, order_index);

COMMIT;


