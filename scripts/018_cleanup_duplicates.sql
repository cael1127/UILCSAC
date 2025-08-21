-- Cleanup duplicate question options and re-seed data
-- This script will clean up any duplicate data and ensure proper seeding

-- First, let's see what we have
SELECT 'Current state:' as info;
SELECT 
    q.title,
    COUNT(qo.id) as option_count,
    STRING_AGG(qo.option_text, ' | ' ORDER BY qo.order_index) as options
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
WHERE q.title = 'Variable Declaration'
GROUP BY q.id, q.title;

-- Remove all existing question options for the Variable Declaration question
DELETE FROM question_options 
WHERE question_id IN (
    SELECT id FROM questions 
    WHERE title = 'Variable Declaration'
);

-- Re-insert the correct options
INSERT INTO question_options (question_id, option_text, is_correct, order_index)
SELECT 
    q.id,
    opt.option_text,
    opt.is_correct,
    opt.order_index
FROM questions q
CROSS JOIN (
    VALUES 
        ('int x = 5;', true, 1),
        ('x = 5;', false, 2),
        ('var x = 5;', false, 3),
        ('5 = x;', false, 4)
) AS opt(option_text, is_correct, order_index)
WHERE q.title = 'Variable Declaration';

-- Verify the cleanup
SELECT 'After cleanup:' as info;
SELECT 
    q.title,
    COUNT(qo.id) as option_count,
    STRING_AGG(qo.option_text, ' | ' ORDER BY qo.order_index) as options
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
WHERE q.title = 'Variable Declaration'
GROUP BY q.id, q.title;
