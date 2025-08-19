-- RLS Policies for Learning Paths System

-- Enable RLS on learning path tables
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;

-- Learning paths - allow authenticated users to read all
CREATE POLICY "Allow authenticated users to read learning paths" ON learning_paths
    FOR SELECT
    TO authenticated
    USING (true);

-- Path modules - allow authenticated users to read all
CREATE POLICY "Allow authenticated users to read path modules" ON path_modules
    FOR SELECT
    TO authenticated
    USING (true);

-- Questions - allow authenticated users to read all
CREATE POLICY "Allow authenticated users to read questions" ON questions
    FOR SELECT
    TO authenticated
    USING (true);

-- Question options - allow authenticated users to read all
CREATE POLICY "Allow authenticated users to read question options" ON question_options
    FOR SELECT
    TO authenticated
    USING (true);

-- User learning progress - allow users to read/write their own progress
CREATE POLICY "Allow users to read own learning progress" ON user_learning_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own learning progress" ON user_learning_progress
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own learning progress" ON user_learning_progress
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- User question responses - allow users to read/write their own responses
CREATE POLICY "Allow users to read own question responses" ON user_question_responses
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own question responses" ON user_question_responses
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own question responses" ON user_question_responses
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('learning_paths', 'path_modules', 'questions', 'question_options', 'user_learning_progress', 'user_question_responses')
ORDER BY tablename, policyname;
