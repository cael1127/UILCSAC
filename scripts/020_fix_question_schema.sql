-- Fix the questions table schema and re-seed data
-- This script ensures the correct field structure and data

-- First, let's check what we currently have
SELECT 'Current table structure:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questions' 
ORDER BY ordinal_position;

-- Check if question_text column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questions' AND column_name = 'question_text'
    ) THEN
        -- Add the question_text column if it doesn't exist
        ALTER TABLE questions ADD COLUMN question_text TEXT;
        RAISE NOTICE 'Added question_text column';
    ELSE
        RAISE NOTICE 'question_text column already exists';
    END IF;
END $$;

-- Clear existing questions data to avoid conflicts
DELETE FROM question_options;
DELETE FROM questions;

-- Re-insert the correct question types
INSERT INTO question_types (name, description) VALUES
('multiple_choice', 'Multiple choice question with predefined options'),
('written', 'Written response question requiring code or explanation'),
('code_completion', 'Fill in the blank code completion'),
('true_false', 'True or false question')
ON CONFLICT (name) DO NOTHING;

-- Get the learning path and modules
DO $$
DECLARE
    path_id UUID;
    basics_module_id UUID;
    control_module_id UUID;
    arrays_module_id UUID;
    oop_module_id UUID;
    question_type_mc UUID;
    question_type_written UUID;
    q_id UUID;
BEGIN
    -- Get the learning path
    SELECT id INTO path_id FROM learning_paths WHERE name = 'Java Fundamentals to Advanced Algorithms';
    
    -- Get the modules
    SELECT id INTO basics_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Java Basics & Variables';
    SELECT id INTO control_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Control Structures';
    SELECT id INTO arrays_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Arrays & Collections';
    SELECT id INTO oop_module_id FROM path_modules WHERE learning_path_id = path_id AND name = 'Object-Oriented Programming';
    
    -- Get question types
    SELECT id INTO question_type_mc FROM question_types WHERE name = 'multiple_choice';
    SELECT id INTO question_type_written FROM question_types WHERE name = 'written';
    
    -- ===== MODULE 1: Java Basics & Variables =====
    
    -- Question 1: Variable Declaration
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (basics_module_id, question_type_mc, 'Variable Declaration', 'What is the correct way to declare a variable in Java?', 'In Java, you must specify the data type before the variable name. The syntax is: dataType variableName;', 10, 1);
    
    -- Get the question ID and insert options
    SELECT id INTO q_id FROM questions WHERE title = 'Variable Declaration' AND path_module_id = basics_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'int x = 5;', true, 1),
    (q_id, 'x = 5;', false, 2),
    (q_id, 'var x = 5;', false, 3),
    (q_id, '5 = x;', false, 4);
    
    -- Question 2: Primitive Data Types
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (basics_module_id, question_type_mc, 'Primitive Data Types', 'Which of the following are primitive data types in Java?', 'Java has 8 primitive data types: byte, short, int, long, float, double, boolean, and char.', 15, 2);
    
    SELECT id INTO q_id FROM questions WHERE title = 'Primitive Data Types' AND path_module_id = basics_module_id;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    (q_id, 'int, double, boolean, char', true, 1),
    (q_id, 'String, Integer, Double, Boolean', false, 2),
    (q_id, 'int, double, String, boolean', false, 3),
    (q_id, 'Integer, Double, Boolean, Character', false, 4);
    
    -- Question 3: Hello World Program
    INSERT INTO questions (path_module_id, question_type_id, title, question_text, explanation, points, order_index) VALUES
    (basics_module_id, question_type_written, 'Hello World Program', 'Write a complete Java program that prints "Hello, World!" to the console. Include the main method and proper syntax.', 'A basic Java program requires a class declaration and a main method. The main method is the entry point of the program.', 20, 3);
    
    RAISE NOTICE 'Re-seeded questions for Java Basics & Variables module';
END $$;

-- Verify the fix
SELECT 'Verification:' as info;
SELECT 
    q.title,
    q.question_text,
    COUNT(qo.id) as option_count
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
GROUP BY q.id, q.title, q.question_text
ORDER BY q.order_index;
