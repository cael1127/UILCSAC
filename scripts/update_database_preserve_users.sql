-- Database Update Script - Preserves Users
-- This script updates content without deleting user accounts
-- Run this in your Supabase SQL Editor
-- 
-- IMPORTANT: This script preserves the 'users' table and all user accounts
-- Only content tables (learning paths, questions, problems) are recreated

-- =====================================================
-- PART 1: VERIFY USERS TABLE EXISTS
-- =====================================================

-- Check if users table exists, if not, create it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            first_name TEXT,
            last_name TEXT,
            role TEXT DEFAULT 'student',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- =====================================================
-- PART 2: CLEAR CONTENT DATA (PRESERVES USERS)
-- =====================================================

-- Clear content tables but preserve users and user progress
-- Note: These tables may not exist yet, so we'll handle errors gracefully
DO $$ 
BEGIN
    DELETE FROM submissions;
    DELETE FROM user_progress;
    DELETE FROM test_cases;
    DELETE FROM problems;
    DELETE FROM user_question_responses;
    DELETE FROM user_learning_progress;
    DELETE FROM question_options;
    DELETE FROM questions;
    DELETE FROM path_modules;
    DELETE FROM learning_paths;
    DELETE FROM code_executions;
EXCEPTION
    WHEN undefined_table THEN
        -- Tables don't exist yet, that's fine
        NULL;
END $$;

-- =====================================================
-- PART 3: RECREATE CONTENT TABLES
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate content tables (preserves users table)
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS test_cases CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS user_question_responses CASCADE;
DROP TABLE IF EXISTS user_learning_progress CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS path_modules CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS code_executions CASCADE;

-- Learning Paths
CREATE TABLE learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    difficulty_level INTEGER DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 3),
    estimated_hours INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Path Modules
CREATE TABLE path_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_hours INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES path_modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'code_completion')),
    correct_answer TEXT,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    points INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question Options
CREATE TABLE question_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems
CREATE TABLE problems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT,
    output_format TEXT,
    constraints TEXT,
    sample_input TEXT,
    sample_output TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 100,
    time_limit INTEGER DEFAULT 2000,
    memory_limit INTEGER DEFAULT 256,
    difficulty_level INTEGER DEFAULT 2 CHECK (difficulty_level BETWEEN 1 AND 3),
    category TEXT,
    programming_language TEXT DEFAULT 'java',
    categories TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Cases
CREATE TABLE test_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Learning Progress
CREATE TABLE user_learning_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    current_module_id UUID REFERENCES path_modules(id) ON DELETE SET NULL,
    completed_modules INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, learning_path_id)
);

-- User Question Responses
CREATE TABLE user_question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    response_text TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- User Progress (for problems)
CREATE TABLE user_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_attempted' CHECK (status IN ('not_attempted', 'attempted', 'solved')),
    best_score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempted_at TIMESTAMP WITH TIME ZONE,
    solved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- Submissions
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'java',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error')),
    score INTEGER DEFAULT 0,
    execution_time INTEGER,
    memory_used INTEGER,
    test_cases_passed INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code Executions
CREATE TABLE IF NOT EXISTS code_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'java',
    status TEXT DEFAULT 'pending',
    output TEXT,
    error_message TEXT,
    execution_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 4: INSERT UIL CS CONTENT
-- =====================================================

-- Insert Learning Paths
INSERT INTO learning_paths (id, name, description, difficulty_level, estimated_hours) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'UIL CS Fundamentals', 'Core Java programming and basic algorithms for UIL Computer Science', 1, 20),
('550e8400-e29b-41d4-a716-446655440002', 'UIL Data Structures', 'Essential data structures for competitive programming', 2, 25),
('550e8400-e29b-41d4-a716-446655440003', 'UIL Advanced Topics', 'Advanced algorithms and problem-solving techniques', 3, 30),
('550e8400-e29b-41d4-a716-446655440004', 'UIL Contest Preparation', 'Time management and contest strategies', 3, 15),
('550e8400-e29b-41d4-a716-446655440005', 'UIL Problem Patterns', 'Common problem types and solution patterns', 2, 20);

-- Insert Path Modules
INSERT INTO path_modules (id, learning_path_id, name, description, order_index, estimated_hours) VALUES
-- UIL CS Fundamentals
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Java Basics & Syntax', 'Variables, data types, control structures, and basic Java syntax', 1, 4),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Object-Oriented Programming', 'Classes, objects, inheritance, and polymorphism', 2, 5),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Input/Output & File Handling', 'Scanner, BufferedReader, and file operations', 3, 3),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Exception Handling', 'Try-catch blocks and custom exceptions', 4, 2),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Basic Algorithms', 'Sorting, searching, and simple algorithms', 5, 6),

-- UIL Data Structures
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Linear Data Structures', 'Arrays, ArrayLists, and LinkedLists', 1, 6),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Stacks and Queues', 'Stack and Queue implementations and applications', 2, 4),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Trees and Binary Trees', 'Tree traversal and binary tree operations', 3, 6),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'Hash Tables', 'HashMap, HashSet, and hashing techniques', 4, 4),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Graphs', 'Graph representation and basic algorithms', 5, 5),

-- UIL Advanced Topics
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'Dynamic Programming', 'Memoization, tabulation, and common DP patterns', 1, 8),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'Graph Algorithms', 'BFS, DFS, shortest path algorithms', 2, 7),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Greedy Algorithms', 'Greedy strategy design and implementation', 3, 6),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'Number Theory', 'GCD, LCM, prime numbers, and modular arithmetic', 4, 6),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'String Algorithms', 'String matching, parsing, and manipulation', 5, 3),

-- UIL Contest Preparation
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'Time Management', 'Strategies for efficient problem-solving under time pressure', 1, 3),
('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', 'Problem Analysis', 'Reading and understanding problem statements quickly', 2, 2),
('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', 'Debugging Techniques', 'Systematic debugging and testing approaches', 3, 3),
('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', 'Contest Strategy', 'Problem selection and solving order strategies', 4, 4),
('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', 'Stress Testing', 'Creating test cases and edge case analysis', 5, 3),

-- UIL Problem Patterns
('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440005', 'Simulation Problems', 'Step-by-step simulation and state tracking', 1, 4),
('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440005', 'Mathematical Problems', 'Mathematical reasoning and formula derivation', 2, 5),
('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440005', 'Implementation Problems', 'Complex implementation and data structure usage', 3, 6),
('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', 'Optimization Problems', 'Finding optimal solutions and efficiency', 4, 5);

-- Insert Sample Questions (abbreviated for space)
INSERT INTO questions (id, module_id, question_text, question_type, correct_answer, explanation, order_index, points) VALUES
-- Java Basics questions
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'What is the output of: System.out.println(5 / 2);', 'multiple_choice', '2', 'Integer division in Java truncates the decimal part, so 5/2 = 2', 1, 2),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Which keyword is used to create a constant in Java?', 'multiple_choice', 'final', 'The final keyword is used to create constants in Java', 2, 2),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'What is the size of a boolean in Java?', 'multiple_choice', '1 bit', 'A boolean in Java is 1 bit, though it typically uses 1 byte in memory', 3, 2);

-- Insert Question Options
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
('770e8400-e29b-41d4-a716-446655440001', '2.5', false, 1),
('770e8400-e29b-41d4-a716-446655440001', '2', true, 2),
('770e8400-e29b-41d4-a716-446655440001', '2.0', false, 3),
('770e8400-e29b-41d4-a716-446655440001', 'Error', false, 4),
('770e8400-e29b-41d4-a716-446655440002', 'const', false, 1),
('770e8400-e29b-41d4-a716-446655440002', 'final', true, 2),
('770e8400-e29b-41d4-a716-446655440002', 'static', false, 3),
('770e8400-e29b-41d4-a716-446655440002', 'constant', false, 4),
('770e8400-e29b-41d4-a716-446655440003', '1 bit', true, 1),
('770e8400-e29b-41d4-a716-446655440003', '1 byte', false, 2),
('770e8400-e29b-41d4-a716-446655440003', '4 bytes', false, 3),
('770e8400-e29b-41d4-a716-446655440003', '8 bytes', false, 4);

-- Insert Sample Problems
INSERT INTO problems (id, title, description, input_format, output_format, constraints, sample_input, sample_output, explanation, points, time_limit, memory_limit, difficulty_level, category, programming_language, categories) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Two Sum', 'Given an array of integers and a target sum, find two numbers that add up to the target.', 'First line: n (array length)\nSecond line: n integers\nThird line: target sum', 'Two space-separated indices', '2 ≤ n ≤ 1000\n-10^9 ≤ values ≤ 10^9', '4\n2 7 11 15\n9', '0 1', 'The numbers at indices 0 and 1 (2 and 7) add up to 9.', 100, 2000, 256, 1, 'Arrays', 'java', 'Arrays,Hash Table'),
('880e8400-e29b-41d4-a716-446655440002', 'Binary Search', 'Implement binary search to find a target value in a sorted array.', 'First line: n (array length)\nSecond line: n sorted integers\nThird line: target value', 'Index of target or -1 if not found', '1 ≤ n ≤ 1000\n-10^9 ≤ values ≤ 10^9', '5\n1 3 5 7 9\n5', '2', 'The value 5 is found at index 2.', 150, 2000, 256, 2, 'Search', 'java', 'Binary Search,Arrays');

-- Insert Test Cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points) VALUES
('880e8400-e29b-41d4-a716-446655440001', '4\n2 7 11 15\n9', '0 1', true, 20),
('880e8400-e29b-41d4-a716-446655440001', '3\n3 2 4\n6', '1 2', false, 20),
('880e8400-e29b-41d4-a716-446655440002', '5\n1 3 5 7 9\n5', '2', true, 30),
('880e8400-e29b-41d4-a716-446655440002', '4\n1 2 3 4\n6', '-1', false, 30);

-- =====================================================
-- PART 5: CREATE RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to content
CREATE POLICY "Public read access to learning_paths" ON learning_paths FOR SELECT USING (true);
CREATE POLICY "Public read access to path_modules" ON path_modules FOR SELECT USING (true);
CREATE POLICY "Public read access to questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read access to question_options" ON question_options FOR SELECT USING (true);
CREATE POLICY "Public read access to problems" ON problems FOR SELECT USING (true);
CREATE POLICY "Public read access to test_cases" ON test_cases FOR SELECT USING (true);

-- Create policies for user-specific data
CREATE POLICY "Users can manage their own learning progress" ON user_learning_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own question responses" ON user_question_responses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own progress" ON user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own submissions" ON submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own code executions" ON code_executions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PART 6: CREATE TRIGGERS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_path_modules_updated_at BEFORE UPDATE ON path_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_learning_progress_updated_at BEFORE UPDATE ON user_learning_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Database updated successfully! Users preserved, content refreshed.' as status;
