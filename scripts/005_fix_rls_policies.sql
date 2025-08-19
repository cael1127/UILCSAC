-- Fix RLS policies for UIL CS Academy
-- This script adds the necessary policies to allow authenticated users to read data

-- Enable RLS on tables (if not already enabled)
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy for problems table - allow authenticated users to read all problems
CREATE POLICY "Allow authenticated users to read problems" ON problems
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for categories table - allow authenticated users to read all categories
CREATE POLICY "Allow authenticated users to read categories" ON categories
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for difficulty_levels table - allow authenticated users to read all difficulty levels
CREATE POLICY "Allow authenticated users to read difficulty_levels" ON difficulty_levels
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for test_cases table - allow authenticated users to read test cases
CREATE POLICY "Allow authenticated users to read test_cases" ON test_cases
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for user_progress table - allow users to read their own progress
CREATE POLICY "Allow users to read own progress" ON user_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for user_progress table - allow users to insert their own progress
CREATE POLICY "Allow users to insert own progress" ON user_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for user_progress table - allow users to update their own progress
CREATE POLICY "Allow users to update own progress" ON user_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for submissions table - allow users to read their own submissions
CREATE POLICY "Allow users to read own submissions" ON submissions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for submissions table - allow users to insert their own submissions
CREATE POLICY "Allow users to insert own submissions" ON submissions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for submissions table - allow users to update their own submissions
CREATE POLICY "Allow users to update own submissions" ON submissions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Optional: Allow public access to problems for unauthenticated users (if you want)
-- CREATE POLICY "Allow public to read problems" ON problems
--     FOR SELECT
--     TO anon
--     USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('problems', 'categories', 'difficulty_levels', 'test_cases', 'user_progress', 'submissions')
ORDER BY tablename, policyname;
