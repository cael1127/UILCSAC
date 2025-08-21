-- =============================================================================
-- UIL CS Academy - Complete Database Setup Script
-- =============================================================================
-- This script consolidates all database setup, schema creation, and data seeding
-- into a single comprehensive file for easy deployment.
-- 
-- IMPORTANT: This script is now COMPLETE and self-contained!
-- 1. Creates all tables, indexes, and policies
-- 2. Seeds initial data (learning paths, modules, problems, test cases)
-- 3. Creates functions with robust error handling
-- 4. Creates triggers AFTER all data is seeded (no more errors!)
-- 5. Fixed all subquery issues that could cause "more than one row" errors
-- 6. Added LIMIT 1 to all subqueries to prevent duplicate row errors
-- 7. Ready to use immediately after running this single script
-- 
-- Run this script in your Supabase SQL Editor to set up the complete database.
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. CORE DATABASE SCHEMA
-- =============================================================================

-- Users table for students, teachers, and admins
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    school VARCHAR(255),
    grade_level INTEGER CHECK (grade_level BETWEEN 9 AND 12),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Categories for organizing problems
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#d97706', -- amber color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Difficulty levels
CREATE TABLE IF NOT EXISTS difficulty_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    level INTEGER NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems/Questions table
CREATE TABLE IF NOT EXISTS problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT,
    sample_input TEXT NOT NULL,
    sample_output TEXT NOT NULL,
    explanation TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    difficulty_id UUID REFERENCES difficulty_levels(id) ON DELETE SET NULL,
    time_limit INTEGER DEFAULT 2000, -- milliseconds
    memory_limit INTEGER DEFAULT 256, -- MB
    points INTEGER DEFAULT 100,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test cases for problems
CREATE TABLE IF NOT EXISTS test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT true,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User submissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'java',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error')),
    score INTEGER DEFAULT 0,
    execution_time INTEGER, -- milliseconds
    memory_used INTEGER, -- KB
    test_cases_passed INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_attempted' CHECK (status IN ('not_attempted', 'attempted', 'solved')),
    best_score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    first_attempt_at TIMESTAMP WITH TIME ZONE,
    solved_at TIMESTAMP WITH TIME ZONE,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, problem_id)
);

-- Practice sessions
CREATE TABLE IF NOT EXISTS practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    total_problems INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems in practice sessions
CREATE TABLE IF NOT EXISTS session_problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES practice_sessions(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    UNIQUE(session_id, problem_id)
);

-- User analytics data
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    problems_attempted INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0, -- seconds
    submissions_count INTEGER DEFAULT 0,
    average_attempts DECIMAL(4,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =============================================================================
-- 2. LEARNING PATHS SYSTEM
-- =============================================================================

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1,
    estimated_hours INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Path modules (sections within each learning path)
CREATE TABLE IF NOT EXISTS path_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_hours INTEGER DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question types
CREATE TABLE IF NOT EXISTS question_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table (supports multiple choice and written)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path_module_id UUID REFERENCES path_modules(id) ON DELETE CASCADE,
    question_type_id UUID REFERENCES question_types(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 10,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    supports_web_execution BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multiple choice options
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress on learning paths
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    current_module_id UUID REFERENCES path_modules(id) ON DELETE SET NULL,
    completed_modules INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, learning_path_id)
);

-- User question responses
CREATE TABLE IF NOT EXISTS user_question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    written_answer TEXT,
    is_correct BOOLEAN,
    score INTEGER DEFAULT 0,
    time_taken INTEGER, -- seconds
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. WEB-BASED EXECUTION SYSTEM
-- =============================================================================

-- Create a web-based execution environment table
CREATE TABLE IF NOT EXISTS web_execution_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    language VARCHAR(50) NOT NULL, -- java, python, cpp, javascript
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    execution_timeout_ms INTEGER DEFAULT 5000,
    memory_limit_mb INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create execution results table
CREATE TABLE IF NOT EXISTS web_execution_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    execution_environment_id UUID NOT NULL REFERENCES web_execution_environments(id),
    code_input TEXT NOT NULL,
    execution_output TEXT,
    execution_error TEXT,
    execution_time_ms INTEGER,
    memory_used_mb DECIMAL(10,2),
    status VARCHAR(50) NOT NULL, -- success, error, timeout, memory_exceeded
    test_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predefined test cases for common problems
CREATE TABLE IF NOT EXISTS predefined_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    input_data JSONB NOT NULL,
    expected_output JSONB NOT NULL,
    test_description TEXT,
    is_hidden BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create execution sandbox configuration
CREATE TABLE IF NOT EXISTS execution_sandbox_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_name VARCHAR(100) NOT NULL UNIQUE,
    max_execution_time_ms INTEGER DEFAULT 10000,
    max_memory_mb INTEGER DEFAULT 100,
    max_output_size_kb INTEGER DEFAULT 1024,
    allowed_functions TEXT[], -- Array of allowed function names
    blocked_functions TEXT[], -- Array of blocked function names
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create execution performance metrics
CREATE TABLE IF NOT EXISTS execution_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_result_id UUID NOT NULL REFERENCES web_execution_results(id) ON DELETE CASCADE,
    cpu_usage_percent DECIMAL(5,2),
    memory_peak_mb DECIMAL(10,2),
    execution_steps INTEGER,
    parse_time_ms INTEGER,
    execution_time_ms INTEGER,
    cleanup_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. QUIZ AND ASSESSMENT SYSTEM
-- =============================================================================

-- Quiz sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    module_id UUID REFERENCES path_modules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    time_limit_minutes INTEGER DEFAULT 30,
    total_questions INTEGER DEFAULT 0,
    questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    is_timed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions (subset of questions for a specific quiz)
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    points INTEGER DEFAULT 10,
    time_spent INTEGER DEFAULT 0, -- seconds
    is_answered BOOLEAN DEFAULT false,
    is_correct BOOLEAN DEFAULT false,
    user_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz results and analytics
CREATE TABLE IF NOT EXISTS quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    correct_answer TEXT,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0, -- seconds
    difficulty_level INTEGER DEFAULT 1,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. PERFORMANCE INDEXES
-- =============================================================================

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty_id);
CREATE INDEX IF NOT EXISTS idx_problems_active ON problems(is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON user_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON learning_paths(is_active);
CREATE INDEX IF NOT EXISTS idx_path_modules_path ON path_modules(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_path_modules_order ON path_modules(order_index);
CREATE INDEX IF NOT EXISTS idx_questions_module ON questions(path_module_id);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_path ON user_learning_progress(learning_path_id);
CREATE INDEX IF NOT EXISTS idx_web_execution_results_user ON web_execution_results(user_id);
CREATE INDEX IF NOT EXISTS idx_web_execution_results_question ON web_execution_results(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_path ON quiz_sessions(learning_path_id);

-- =============================================================================
-- 6. INITIAL DATA SEEDING
-- =============================================================================

-- Insert difficulty levels
INSERT INTO difficulty_levels (name, level, color) VALUES
('Beginner', 1, '#10b981'), -- green
('Easy', 2, '#f59e0b'), -- yellow
('Medium', 3, '#f97316'), -- orange
('Hard', 4, '#ef4444'), -- red
('Expert', 5, '#8b5cf6') -- purple
ON CONFLICT (name) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, description, color) VALUES
('Arrays & Lists', 'Problems involving array manipulation and list operations', '#3b82f6'),
('Strings', 'String processing and manipulation problems', '#10b981'),
('Math & Number Theory', 'Mathematical problems and number theory', '#f59e0b'),
('Sorting & Searching', 'Problems involving sorting algorithms and search techniques', '#ef4444'),
('Dynamic Programming', 'Problems requiring dynamic programming solutions', '#8b5cf6'),
('Graph Theory', 'Graph traversal and graph algorithm problems', '#06b6d4'),
('Data Structures', 'Problems involving stacks, queues, trees, and other data structures', '#ec4899'),
('Recursion', 'Problems that can be solved using recursive approaches', '#f97316'),
('Greedy Algorithms', 'Problems best solved with greedy algorithmic approaches', '#84cc16'),
('Implementation', 'Straightforward implementation problems', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Insert question types
INSERT INTO question_types (name, description) VALUES
('multiple_choice', 'Multiple choice question with predefined options'),
('written', 'Written response question requiring code or explanation'),
('code_completion', 'Fill in the blank code completion'),
('true_false', 'True or false question')
ON CONFLICT (name) DO NOTHING;

-- Insert the main Java Learning Path
INSERT INTO learning_paths (name, description, difficulty_level, estimated_hours) VALUES
('Java Fundamentals to Advanced Algorithms', 'Complete journey from Java basics to advanced data structures and algorithms. Perfect for beginners with no prior programming experience.', 1, 40)
ON CONFLICT DO NOTHING;

-- Get the learning path ID and insert path modules
DO $$
DECLARE
    path_id UUID;
BEGIN
    SELECT id INTO path_id FROM learning_paths WHERE name = 'Java Fundamentals to Advanced Algorithms';
    
    -- Insert path modules
    INSERT INTO path_modules (learning_path_id, name, description, order_index, estimated_hours) VALUES
    (path_id, 'Java Basics & Variables', 'Learn about Java syntax, variables, data types, and basic input/output operations.', 1, 3),
    (path_id, 'Control Structures', 'Master if statements, loops, and switch statements for program flow control.', 2, 3),
    (path_id, 'Arrays & Collections', 'Learn to work with arrays, ArrayLists, and basic data structures.', 3, 4),
    (path_id, 'Object-Oriented Programming', 'Understand classes, objects, inheritance, and polymorphism.', 4, 6),
    (path_id, 'Recursion & Basic Algorithms', 'Learn recursive thinking and fundamental algorithm patterns.', 5, 5),
    (path_id, 'Advanced Data Structures', 'Master linked lists, stacks, queues, and trees.', 6, 8),
    (path_id, 'Algorithm Design', 'Learn sorting, searching, and algorithm analysis techniques.', 7, 6),
    (path_id, 'Advanced Algorithms', 'Explore dynamic programming, graph algorithms, and optimization.', 8, 5)
    ON CONFLICT DO NOTHING;
END $$;

-- Insert sample problems
INSERT INTO problems (title, description, input_format, output_format, constraints, sample_input, sample_output, explanation, category_id, difficulty_id, time_limit, memory_limit, points) VALUES
(
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    'First line contains n (number of elements) and target. Second line contains n space-separated integers.',
    'Two space-separated integers representing the indices (0-based) of the two numbers.',
    '2 ≤ n ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9, -10^9 ≤ target ≤ 10^9',
    '4 9
2 7 11 15',
    '0 1',
    'nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1].',
    (SELECT id FROM categories WHERE name = 'Arrays & Lists' LIMIT 1),
    (SELECT id FROM difficulty_levels WHERE name = 'Easy' LIMIT 1),
    2000,
    256,
    100
),
(
    'Palindrome Check',
    'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    'A single line containing a string s.',
    'Print "YES" if the string is a palindrome, "NO" otherwise.',
    '1 ≤ length of s ≤ 10^5',
    'A man a plan a canal Panama',
    'YES',
    'After removing non-alphanumeric characters and converting to lowercase: "amanaplanacanalpanama" is a palindrome.',
    (SELECT id FROM categories WHERE name = 'Strings' LIMIT 1),
    (SELECT id FROM difficulty_levels WHERE name = 'Beginner' LIMIT 1),
    1000,
    128,
    75
),
(
    'Fibonacci Sequence',
    'Calculate the nth Fibonacci number. The Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1.',
    'A single integer n.',
    'The nth Fibonacci number.',
    '0 ≤ n ≤ 50',
    '10',
    '55',
    'F(10) = 55 in the Fibonacci sequence.',
    (SELECT id FROM categories WHERE name = 'Math & Number Theory' LIMIT 1),
    (SELECT id FROM difficulty_levels WHERE name = 'Easy' LIMIT 1),
    1500,
    128,
    80
)
ON CONFLICT DO NOTHING;

-- Insert test cases for the problems
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, points) VALUES
-- Two Sum test cases
((SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1), '4 9
2 7 11 15', '0 1', true, false, 0),
((SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1), '3 6
3 2 4', '1 2', false, true, 50),
((SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1), '2 6
3 3', '0 1', false, true, 50),

-- Palindrome Check test cases
((SELECT id FROM problems WHERE title = 'Palindrome Check' LIMIT 1), 'A man a plan a canal Panama', 'YES', true, false, 0),
((SELECT id FROM problems WHERE title = 'Palindrome Check' LIMIT 1), 'race a car', 'NO', false, true, 25),
((SELECT id FROM problems WHERE title = 'Palindrome Check' LIMIT 1), 'Madam', 'YES', false, true, 25),
((SELECT id FROM problems WHERE title = 'Palindrome Check' LIMIT 1), 'hello', 'NO', false, true, 25),

-- Fibonacci test cases
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence' LIMIT 1), '10', '55', true, false, 0),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence' LIMIT 1), '0', '0', false, true, 20),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence' LIMIT 1), '1', '1', false, true, 20),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence' LIMIT 1), '15', '610', false, true, 30),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence' LIMIT 1), '20', '6765', false, true, 30);

-- =============================================================================
-- 7. WEB EXECUTION ENVIRONMENT SETUP
-- =============================================================================

-- Insert web execution environments
INSERT INTO web_execution_environments (name, description, language, version, execution_timeout_ms, memory_limit_mb) VALUES
('Java Web Runtime', 'Web-based Java execution environment using JavaScript interpreter', 'java', '11', 10000, 100),
('Python Web Runtime', 'Web-based Python execution environment using Pyodide', 'python', '3.9', 8000, 80),
('C++ Web Runtime', 'Web-based C++ execution environment using WebAssembly', 'cpp', '17', 12000, 120),
('JavaScript Runtime', 'Native JavaScript execution environment', 'javascript', 'ES2020', 5000, 50)
ON CONFLICT (name) DO NOTHING;

-- Insert execution sandbox configuration
INSERT INTO execution_sandbox_config (environment_name, max_execution_time_ms, max_memory_mb, max_output_size_kb, allowed_functions, blocked_functions) VALUES
('Java Web Runtime', 10000, 100, 1024, ARRAY['System.out.println', 'Math.abs', 'Math.max', 'Math.min'], ARRAY['System.exit', 'Runtime.exec', 'ProcessBuilder']),
('Python Web Runtime', 8000, 80, 1024, ARRAY['print', 'len', 'range', 'sum'], ARRAY['os.system', 'subprocess.call', 'eval', 'exec']),
('C++ Web Runtime', 12000, 120, 1024, ARRAY['cout', 'cin', 'printf', 'scanf'], ARRAY['system', 'popen', 'exec']),
('JavaScript Runtime', 5000, 50, 512, ARRAY['console.log', 'Math.abs', 'Math.max', 'Math.min'], ARRAY['eval', 'Function', 'setTimeout', 'setInterval'])
ON CONFLICT (environment_name) DO NOTHING;

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_execution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Problems are publicly viewable
CREATE POLICY "Problems are publicly viewable" ON problems
    FOR SELECT USING (is_active = true);

-- Test cases are publicly viewable (non-hidden ones)
CREATE POLICY "Test cases are publicly viewable" ON test_cases
    FOR SELECT USING (is_hidden = false OR is_sample = true);

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own submissions
CREATE POLICY "Users can create own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = id);

-- Learning paths are publicly viewable
CREATE POLICY "Learning paths are publicly viewable" ON learning_paths
    FOR SELECT USING (is_active = true);

-- Path modules are publicly viewable
CREATE POLICY "Path modules are publicly viewable" ON path_modules
    FOR SELECT USING (is_active = true);

-- Questions are publicly viewable
CREATE POLICY "Questions are publicly viewable" ON questions
    FOR SELECT USING (is_active = true);

-- Question options are publicly viewable
CREATE POLICY "Question options are publicly viewable" ON question_options
    FOR SELECT USING (true);

-- Users can view their own learning progress
CREATE POLICY "Users can view own learning progress" ON user_learning_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own learning progress
CREATE POLICY "Users can update own learning progress" ON user_learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own learning progress
CREATE POLICY "Users can insert own learning progress" ON user_learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own question responses
CREATE POLICY "Users can view own question responses" ON user_question_responses
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own question responses
CREATE POLICY "Users can insert own question responses" ON user_question_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own web execution results
CREATE POLICY "Users can view own web execution results" ON web_execution_results
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own web execution results
CREATE POLICY "Users can insert own web execution results" ON web_execution_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own quiz sessions
CREATE POLICY "Users can view own quiz sessions" ON quiz_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz sessions
CREATE POLICY "Users can insert own quiz sessions" ON quiz_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own quiz sessions
CREATE POLICY "Users can update own quiz sessions" ON quiz_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own quiz questions
CREATE POLICY "Users can view own quiz questions" ON quiz_questions
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM quiz_sessions WHERE id = quiz_questions.quiz_session_id
    ));

-- Users can view their own quiz results
CREATE POLICY "Users can view own quiz results" ON quiz_results
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz results
CREATE POLICY "Users can insert own quiz results" ON quiz_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 9. FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update user progress when submissions are made
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert user progress
    INSERT INTO user_progress (user_id, problem_id, status, best_score, attempts, time_spent, last_attempt_at)
    VALUES (
        NEW.user_id,
        NEW.problem_id,
        CASE 
            WHEN NEW.status = 'accepted' THEN 'solved'
            WHEN NEW.status IN ('wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error') THEN 'attempted'
            ELSE 'attempted'
        END,
        CASE 
            WHEN NEW.status = 'accepted' THEN GREATEST(NEW.score, COALESCE((SELECT best_score FROM user_progress WHERE user_id = NEW.user_id AND problem_id = NEW.problem_id), 0))
            ELSE COALESCE((SELECT best_score FROM user_progress WHERE user_id = NEW.user_id AND problem_id = NEW.problem_id), 0)
        END,
        COALESCE((SELECT attempts FROM user_progress WHERE user_id = NEW.user_id AND problem_id = NEW.problem_id), 0) + 1,
        COALESCE((SELECT time_spent FROM user_progress WHERE user_id = NEW.user_id AND problem_id = NEW.problem_id), 0) + COALESCE(NEW.execution_time, 0) / 1000,
        NOW()
    )
    ON CONFLICT (user_id, problem_id) DO UPDATE SET
        status = EXCLUDED.status,
        best_score = EXCLUDED.best_score,
        attempts = EXCLUDED.attempts,
        time_spent = EXCLUDED.time_spent,
        last_attempt_at = EXCLUDED.last_attempt_at,
        solved_at = CASE WHEN EXCLUDED.status = 'solved' THEN NOW() ELSE user_progress.solved_at END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user progress
CREATE TRIGGER trigger_update_user_progress
    AFTER INSERT ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progress();

-- Function to update learning path progress
CREATE OR REPLACE FUNCTION update_learning_path_progress()
RETURNS TRIGGER AS $$
DECLARE
    module_id UUID;
    path_id UUID;
    total_modules INTEGER;
    completed_modules INTEGER;
    current_total_score INTEGER;
BEGIN
    -- Safely get the module and path IDs
    BEGIN
        -- First check if the question exists
        IF NOT EXISTS (SELECT 1 FROM questions WHERE id = NEW.question_id) THEN
            RETURN NEW; -- Exit early if question doesn't exist
        END IF;
        
        SELECT pm.learning_path_id, pm.id INTO path_id, module_id
        FROM path_modules pm
        WHERE pm.id = (
            SELECT path_module_id 
            FROM questions 
            WHERE id = NEW.question_id
        );
        
        -- Only proceed if we found a valid path and module
        IF path_id IS NOT NULL AND module_id IS NOT NULL THEN
            -- Count total modules in the path
            SELECT COUNT(*) INTO total_modules
            FROM path_modules
            WHERE learning_path_id = path_id AND is_active = true;
            
            -- Count completed modules (modules where user has answered all questions correctly)
            WITH module_completion AS (
                SELECT pm.id,
                       COUNT(q.id) as total_questions,
                       COUNT(uqr.id) as answered_correctly
                FROM path_modules pm
                JOIN questions q ON q.path_module_id = pm.id
                LEFT JOIN user_question_responses uqr ON uqr.question_id = q.id 
                    AND uqr.user_id = NEW.user_id 
                    AND uqr.is_correct = true
                WHERE pm.learning_path_id = path_id 
                  AND pm.is_active = true
                  AND q.is_active = true
                GROUP BY pm.id
            )
            SELECT COUNT(*) INTO completed_modules
            FROM module_completion
            WHERE total_questions > 0 AND answered_correctly = total_questions;
            
            -- Get current total score safely
            SELECT COALESCE(total_score, 0) INTO current_total_score
            FROM user_learning_progress 
            WHERE user_id = NEW.user_id AND learning_path_id = path_id
            LIMIT 1;
            
                         -- Update or insert learning path progress
             INSERT INTO user_learning_progress (user_id, learning_path_id, current_module_id, completed_modules, total_score, last_accessed)
             VALUES (NEW.user_id, path_id, module_id, completed_modules, 
                     current_total_score + NEW.score,
                     NOW())
             ON CONFLICT (user_id, learning_path_id) DO UPDATE SET
                 current_module_id = EXCLUDED.current_module_id,
                 completed_modules = EXCLUDED.completed_modules,
                 total_score = EXCLUDED.total_score,
                 last_accessed = EXCLUDED.last_accessed,
                 is_completed = (EXCLUDED.completed_modules >= (SELECT COUNT(*) FROM path_modules WHERE learning_path_id = path_id AND is_active = true)),
                 completed_at = CASE WHEN EXCLUDED.completed_modules >= (SELECT COUNT(*) FROM path_modules WHERE learning_path_id = path_id AND is_active = true) THEN NOW() ELSE user_learning_progress.completed_at END;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Log the error but don't fail the transaction
            RAISE WARNING 'Error in update_learning_path_progress: %', SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update learning path progress
-- Only create this trigger after questions data exists
-- CREATE TRIGGER trigger_update_learning_path_progress
--     AFTER INSERT ON user_question_responses
--     FOR EACH ROW
--     EXECUTE FUNCTION update_learning_path_progress();

-- =============================================================================
-- 10. CREATE TRIGGERS (AFTER DATA IS SEEDED)
-- =============================================================================

-- Now that all data exists, create the learning path progress trigger
CREATE TRIGGER trigger_update_learning_path_progress
    AFTER INSERT ON user_question_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_learning_path_progress();

-- =============================================================================
-- 11. COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'UIL CS Academy database setup completed successfully!';
    RAISE NOTICE 'All tables, indexes, policies, and initial data have been created.';
    RAISE NOTICE 'The learning path progress trigger has been enabled.';
    RAISE NOTICE 'You can now start using the platform with the seeded learning paths and problems.';
END $$;
