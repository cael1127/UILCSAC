-- Complete Setup Script for UIL CS Academy
-- This script creates the database schema and seeds initial data
-- Run this in your Supabase SQL Editor to set up everything at once
-- INCLUDES ROW LEVEL SECURITY (RLS) POLICIES FOR DATA PROTECTION

-- ========================================
-- STEP 1: CREATE DATABASE SCHEMA
-- ========================================

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

-- ========================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: CREATE SECURITY POLICIES
-- ========================================

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories table policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view categories" ON categories
    FOR SELECT USING (auth.role() = 'authenticated');

-- Difficulty levels table policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view difficulty levels" ON difficulty_levels
    FOR SELECT USING (auth.role() = 'authenticated');

-- Problems table policies
CREATE POLICY "Authenticated users can view active problems" ON problems
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Only admins can create problems" ON problems
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can update problems" ON problems
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Only admins can delete problems" ON problems
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Test cases table policies
CREATE POLICY "Authenticated users can view sample test cases" ON test_cases
    FOR SELECT USING (
        auth.role() = 'authenticated' AND 
        (is_sample = true OR 
         EXISTS (
             SELECT 1 FROM submissions 
             WHERE submissions.problem_id = test_cases.problem_id 
             AND submissions.user_id = auth.uid()
         ))
    );

CREATE POLICY "Only admins can manage test cases" ON test_cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Submissions table policies
CREATE POLICY "Users can view their own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions" ON submissions
    FOR DELETE USING (auth.uid() = user_id);

-- User progress table policies
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON user_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Practice sessions table policies
CREATE POLICY "Users can view their own practice sessions" ON practice_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practice sessions" ON practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice sessions" ON practice_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice sessions" ON practice_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Session problems table policies
CREATE POLICY "Users can view their own session problems" ON session_problems
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM practice_sessions 
            WHERE practice_sessions.id = session_problems.session_id 
            AND practice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own session problems" ON session_problems
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM practice_sessions 
            WHERE practice_sessions.id = session_problems.session_id 
            AND practice_sessions.user_id = auth.uid()
        )
    );

-- User analytics table policies
CREATE POLICY "Users can view their own analytics" ON user_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" ON user_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" ON user_analytics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics" ON user_analytics
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- STEP 4: SEED INITIAL DATA
-- ========================================

-- Clear any existing data first to avoid conflicts
DELETE FROM test_cases;
DELETE FROM problems;
DELETE FROM categories;
DELETE FROM difficulty_levels;

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

-- Insert sample problems (FIXED - Using explicit IDs to avoid subquery issues)
DO $$
DECLARE
    arrays_category_id UUID;
    strings_category_id UUID;
    math_category_id UUID;
    easy_difficulty_id UUID;
    beginner_difficulty_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO arrays_category_id FROM categories WHERE name = 'Arrays & Lists' LIMIT 1;
    SELECT id INTO strings_category_id FROM categories WHERE name = 'Strings' LIMIT 1;
    SELECT id INTO math_category_id FROM categories WHERE name = 'Math & Number Theory' LIMIT 1;
    
    -- Get difficulty IDs
    SELECT id INTO easy_difficulty_id FROM difficulty_levels WHERE name = 'Easy' LIMIT 1;
    SELECT id INTO beginner_difficulty_id FROM difficulty_levels WHERE name = 'Beginner' LIMIT 1;
    
    -- Insert problems with explicit IDs
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
        arrays_category_id,
        easy_difficulty_id,
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
        strings_category_id,
        beginner_difficulty_id,
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
        math_category_id,
        easy_difficulty_id,
        1500,
        128,
        80
    );
END $$;

-- Insert test cases for the problems (FIXED - Using explicit IDs)
DO $$
DECLARE
    two_sum_id UUID;
    palindrome_id UUID;
    fibonacci_id UUID;
BEGIN
    -- Get problem IDs
    SELECT id INTO two_sum_id FROM problems WHERE title = 'Two Sum' LIMIT 1;
    SELECT id INTO palindrome_id FROM problems WHERE title = 'Palindrome Check' LIMIT 1;
    SELECT id INTO fibonacci_id FROM problems WHERE title = 'Fibonacci Sequence' LIMIT 1;
    
    -- Insert test cases with explicit IDs
    INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, points) VALUES
    -- Two Sum test cases
    (two_sum_id, '4 9
2 7 11 15', '0 1', true, false, 0),
    (two_sum_id, '3 6
3 2 4', '1 2', false, true, 50),
    (two_sum_id, '2 6
3 3', '0 1', false, true, 50),

    -- Palindrome Check test cases
    (palindrome_id, 'A man a plan a canal Panama', 'YES', true, false, 0),
    (palindrome_id, 'race a car', 'NO', false, true, 25),
    (palindrome_id, 'Madam', 'YES', false, true, 25),
    (palindrome_id, 'hello', 'NO', false, true, 25),

    -- Fibonacci test cases
    (fibonacci_id, '10', '55', true, false, 0),
    (fibonacci_id, '0', '0', false, true, 20),
    (fibonacci_id, '1', '1', false, true, 20),
    (fibonacci_id, '15', '610', false, true, 30),
    (fibonacci_id, '20', '6765', false, true, 30);
END $$;

-- ========================================
-- SECURITY FEATURES ENABLED!
-- ========================================
-- Your database now has:
-- 1. Row Level Security (RLS) enabled on all tables
-- 2. Users can only see their own data (submissions, progress, etc.)
-- 3. Problems are only visible to authenticated users
-- 4. Test cases are restricted (sample cases visible, hidden cases only after submission)
-- 5. Only admins can create/modify problems and test cases
-- 6. All user data is completely isolated and private
-- 
-- Go back to your app and refresh the dashboard!
