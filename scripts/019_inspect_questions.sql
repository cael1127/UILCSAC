-- Inspect the questions table structure and data
-- This will help identify any field mismatches

-- Check table structure
SELECT 'Table Structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'questions' 
ORDER BY ordinal_position;

-- Check actual data in the questions table
SELECT 'Questions Data:' as info;
SELECT 
    id,
    title,
    question_text,
    explanation,
    points,
    order_index,
    is_active,
    created_at
FROM questions 
WHERE title = 'Variable Declaration'
ORDER BY created_at;

-- Check if question_text field exists and has data
SELECT 'Question Text Check:' as info;
SELECT 
    CASE 
        WHEN question_text IS NULL THEN 'NULL'
        WHEN question_text = '' THEN 'EMPTY STRING'
        ELSE 'HAS DATA: ' || LEFT(question_text, 50)
    END as question_text_status,
    COUNT(*) as count
FROM questions 
GROUP BY 
    CASE 
        WHEN question_text IS NULL THEN 'NULL'
        WHEN question_text = '' THEN 'EMPTY STRING'
        ELSE 'HAS DATA: ' || LEFT(question_text, 50)
    END;

-- Check all fields for a specific question
SELECT 'Full Question Record:' as info;
SELECT * FROM questions WHERE title = 'Variable Declaration' LIMIT 1;
