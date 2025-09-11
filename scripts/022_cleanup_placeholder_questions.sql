-- Purpose: Remove generic placeholder questions created by bulk seeding
-- Safe: Only deletes questions matching the exact generic pattern we inserted

-- Delete MCQ placeholders like: "Which concept best relates to this module: <name>?"
DELETE FROM questions q
USING path_modules pm
WHERE q.module_id = pm.id
  AND q.question_text = 'Which concept best relates to this module: ' || pm.name || '?';

-- Delete code_completion placeholders like: "Complete the code snippet relevant to: <name>"
DELETE FROM questions q
USING path_modules pm
WHERE q.module_id = pm.id
  AND q.question_text = 'Complete the code snippet relevant to: ' || pm.name;

-- Note: Does not touch users or progress tables.

