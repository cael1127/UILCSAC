-- Complete Database Setup for UIL CS Academy (FIXED VERSION)
-- This single script sets up all tables, policies, and sample data
-- Run this entire script in your Supabase SQL Editor

-- =====================================================
-- PART 0: CLEANUP EXISTING DATA (DESTRUCTIVE)
-- =====================================================

-- Drop all existing tables in reverse dependency order
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
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- PART 1: ENABLE EXTENSIONS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 2: CREATE ALL TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    school TEXT,
    grade_level INTEGER,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Code executions table for storing execution history
CREATE TABLE IF NOT EXISTS code_executions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    question_id UUID,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'java',
    success BOOLEAN NOT NULL,
    output TEXT,
    error TEXT,
    execution_time INTEGER DEFAULT 0,
    memory_usage INTEGER DEFAULT 0,
    environment TEXT DEFAULT 'browser',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Learning paths table
CREATE TABLE learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    estimated_hours INTEGER DEFAULT 0,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level IN (1, 2, 3)),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Path modules table
CREATE TABLE path_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    estimated_hours INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES path_modules(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'written_response', 'code_completion')),
    correct_answer TEXT,
    explanation TEXT,
    order_index INTEGER NOT NULL,
    points INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question options table (for multiple choice questions)
CREATE TABLE IF NOT EXISTS question_options (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User learning progress table
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

-- User question responses table
CREATE TABLE IF NOT EXISTS user_question_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    response_text TEXT,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- Problems table (for practice problems)
CREATE TABLE problems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level IN (1, 2, 3)),
    category TEXT,
    points INTEGER DEFAULT 100,
    time_limit INTEGER DEFAULT 1000, -- milliseconds
    memory_limit INTEGER DEFAULT 50, -- MB
    programming_language TEXT DEFAULT 'java',
    categories TEXT, -- comma-separated categories
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test cases table
CREATE TABLE test_cases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User progress table (for practice problems)
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

-- Submissions table
CREATE TABLE submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'java',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error')),
    score INTEGER DEFAULT 0,
    execution_time INTEGER DEFAULT 0,
    memory_usage INTEGER DEFAULT 0,
    error_message TEXT,
    test_results JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_code_executions_user_id ON code_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_code_executions_created_at ON code_executions(created_at);
CREATE INDEX IF NOT EXISTS idx_questions_module_id ON questions(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);

-- =====================================================
-- PART 4: CREATE TRIGGER FUNCTIONS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_path_modules_updated_at BEFORE UPDATE ON path_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 6: CREATE RLS POLICIES
-- =====================================================

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Code executions policies
CREATE POLICY "Users can view their own code executions" ON code_executions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own code executions" ON code_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Learning paths policies (public read, admin write)
CREATE POLICY "Anyone can view active learning paths" ON learning_paths
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage learning paths" ON learning_paths
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Path modules policies
CREATE POLICY "Anyone can view active path modules" ON path_modules
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage path modules" ON path_modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Questions policies
CREATE POLICY "Anyone can view active questions" ON questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Question options policies
CREATE POLICY "Anyone can view question options" ON question_options
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage question options" ON question_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- User learning progress policies
CREATE POLICY "Users can view their own learning progress" ON user_learning_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" ON user_learning_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON user_learning_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User question responses policies
CREATE POLICY "Users can view their own question responses" ON user_question_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own question responses" ON user_question_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question responses" ON user_question_responses
    FOR UPDATE USING (auth.uid() = user_id);

-- Problems policies (public read, admin write)
CREATE POLICY "Anyone can view active problems" ON problems
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage problems" ON problems
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Test cases policies
CREATE POLICY "Anyone can view test cases" ON test_cases
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage test cases" ON test_cases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- User progress policies
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service role bypass (for API routes)
CREATE POLICY "Service role can do everything" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON code_executions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON learning_paths
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON path_modules
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON questions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON question_options
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON user_learning_progress
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON user_question_responses
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON problems
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON test_cases
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON user_progress
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON submissions
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- PART 7: INSERT SAMPLE DATA
-- =====================================================

-- Insert sample learning paths
INSERT INTO learning_paths (id, name, description, estimated_hours, difficulty_level) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'UIL CS Fundamentals', 'Essential Java programming concepts for UIL Computer Science', 25, 1),
    ('550e8400-e29b-41d4-a716-446655440002', 'UIL Data Structures', 'Core data structures and algorithms for UIL contests', 30, 2),
    ('550e8400-e29b-41d4-a716-446655440003', 'UIL Advanced Topics', 'Advanced algorithms and problem-solving strategies', 35, 3),
    ('550e8400-e29b-41d4-a716-446655440004', 'UIL Contest Preparation', 'Mock contests and time management strategies', 20, 2),
    ('550e8400-e29b-41d4-a716-446655440005', 'UIL Problem Patterns', 'Common UIL problem types and solution templates', 25, 2);

-- Insert UIL CS Fundamentals modules
INSERT INTO path_modules (id, learning_path_id, name, description, order_index, estimated_hours) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Java Basics & Syntax', 'Variables, data types, operators, and basic Java syntax', 1, 4),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Control Flow', 'If statements, loops, switch statements, and boolean logic', 2, 5),
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Methods & Functions', 'Method creation, parameters, return values, and scope', 3, 4),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Arrays & ArrayLists', 'Array manipulation, ArrayList operations, and common patterns', 4, 5),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'String Processing', 'String methods, parsing, and text manipulation techniques', 5, 4),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'File I/O', 'Reading from and writing to files, Scanner usage', 6, 3);

-- Insert UIL Data Structures modules
INSERT INTO path_modules (id, learning_path_id, name, description, order_index, estimated_hours) VALUES
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Linear Data Structures', 'Arrays, ArrayLists, Stacks, and Queues', 1, 6),
    ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'Sorting Algorithms', 'Bubble, Selection, Insertion, and Merge Sort', 2, 5),
    ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'Searching Algorithms', 'Linear and Binary Search, complexity analysis', 3, 4),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Recursion', 'Recursive thinking, base cases, and common patterns', 4, 6),
    ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Hash Tables & Sets', 'HashMap, HashSet, and their applications', 5, 4),
    ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Trees & Binary Trees', 'Tree traversal, binary tree operations', 6, 5);

-- Insert UIL Advanced Topics modules
INSERT INTO path_modules (id, learning_path_id, name, description, order_index, estimated_hours) VALUES
    ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Dynamic Programming', 'Memoization, tabulation, and common DP patterns', 1, 8),
    ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'Graph Algorithms', 'BFS, DFS, shortest path algorithms', 2, 7),
    ('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'Greedy Algorithms', 'Greedy strategy design and implementation', 3, 6),
    ('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440003', 'Number Theory', 'GCD, LCM, prime numbers, and modular arithmetic', 4, 6),
    ('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', 'Advanced Data Structures', 'Priority Queues, Segment Trees, Fenwick Trees', 5, 8);

-- Insert UIL Contest Preparation modules
INSERT INTO path_modules (id, learning_path_id, name, description, order_index, estimated_hours) VALUES
    ('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', 'Time Management', 'Strategies for efficient problem-solving under time pressure', 1, 4),
    ('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440004', 'Problem Analysis', 'Reading problems, identifying patterns, and solution approaches', 2, 5),
    ('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440004', 'Mock Contests', 'Practice with UIL-style problems and timing', 3, 6),
    ('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440004', 'Debugging Strategies', 'Common errors and systematic debugging approaches', 4, 3),
    ('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440004', 'Test Case Design', 'Creating and validating test cases', 5, 2);

-- Insert UIL Problem Patterns modules
INSERT INTO path_modules (id, learning_path_id, name, description, order_index, estimated_hours) VALUES
    ('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440005', 'Simulation Problems', 'Step-by-step simulation and state tracking', 1, 5),
    ('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440005', 'Mathematical Problems', 'Number theory, combinatorics, and probability', 2, 6),
    ('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440005', 'String Processing', 'Pattern matching, parsing, and text analysis', 3, 5),
    ('660e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440005', 'Geometry Problems', 'Coordinate geometry, distance calculations, and shapes', 4, 4),
    ('660e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440005', 'Implementation Problems', 'Complex data structure implementation and edge cases', 5, 5);

-- Insert UIL CS Questions for all modules
INSERT INTO questions (id, module_id, question_text, question_type, correct_answer, explanation, order_index, points) VALUES
    -- UIL CS Fundamentals - Java Basics & Syntax
    ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'What is the output of: int x = 5; int y = x++ + ++x; System.out.println(y);', 'multiple_choice', '12', 'x++ returns 5 then increments to 6, ++x increments to 7 then returns 7. So y = 5 + 7 = 12.', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'What is the output of: String s1 = "Hello"; String s2 = new String("Hello"); System.out.println(s1 == s2);', 'multiple_choice', 'false', 's1 is a string literal (interned), s2 is a new object. == compares references, not values.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'What is the output of: System.out.println(1.0 / 0.0);', 'multiple_choice', 'Infinity', 'Dividing by 0.0 in floating-point arithmetic results in Infinity, not an exception.', 3, 3),
    
    -- UIL CS Fundamentals - Control Flow
    ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', 'What is the output of: for (int i = 0; i < 3; i++) { if (i == 1) continue; System.out.print(i); }', 'multiple_choice', '02', 'The loop prints 0, skips 1 (continue), then prints 2. Output is "02".', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'What is the output of: int x = 10; while (x > 0) { x -= 3; if (x == 4) break; } System.out.println(x);', 'multiple_choice', '4', 'x becomes 7, then 4. The break statement exits the loop when x == 4.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'What is the output of: int x = 5; int y = (x > 3) ? x * 2 : x + 1; System.out.println(y);', 'multiple_choice', '10', 'Since x > 3 is true, the ternary operator returns x * 2 = 5 * 2 = 10.', 3, 2),
    
    -- UIL CS Fundamentals - Methods & Functions
    ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', 'What keyword is used to indicate a method returns no value?', 'multiple_choice', 'void', 'The void keyword indicates that a method does not return a value.', 1, 1),
    ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'What is the scope of a local variable?', 'multiple_choice', 'Only within the method where it is declared', 'Local variables are only accessible within the method or block where they are declared.', 2, 1),
    ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', 'Write a method that takes two integers and returns their sum.', 'code_completion', 'public static int add(int a, int b) {\n    return a + b;\n}', 'This demonstrates method declaration, parameters, and return statement.', 3, 2),
    
    -- UIL Data Structures - Linear Data Structures
    ('770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440007', 'What is the time complexity of accessing an element in an array?', 'multiple_choice', 'O(1)', 'Array access is constant time because you can directly calculate the memory address using the index.', 1, 1),
    ('770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440007', 'Which data structure follows the LIFO (Last In, First Out) principle?', 'multiple_choice', 'Stack', 'A stack is a LIFO data structure where the last element added is the first one to be removed.', 2, 1),
    ('770e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440007', 'What is the time complexity of adding an element to the end of an ArrayList?', 'multiple_choice', 'O(1)', 'Adding to the end of an ArrayList is typically O(1) amortized time.', 3, 1),
    
    -- UIL Data Structures - Sorting Algorithms
    ('770e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440008', 'What is the time complexity of bubble sort in the worst case?', 'multiple_choice', 'O(n²)', 'Bubble sort has O(n²) time complexity in the worst case due to nested loops.', 1, 1),
    ('770e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440008', 'Which sorting algorithm has the best average-case time complexity?', 'multiple_choice', 'Merge Sort', 'Merge sort has O(n log n) time complexity in all cases, making it very efficient.', 2, 1),
    ('770e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440008', 'What is the space complexity of merge sort?', 'multiple_choice', 'O(n)', 'Merge sort requires O(n) extra space for the temporary arrays during merging.', 3, 1),
    
    -- UIL Advanced Topics - Dynamic Programming
    ('770e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440013', 'What is the optimal substructure property in dynamic programming?', 'multiple_choice', 'The optimal solution contains optimal solutions to subproblems', 'DP problems must have optimal substructure - the best solution uses the best solutions to smaller problems.', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440013', 'What is the time complexity of the knapsack problem using DP?', 'multiple_choice', 'O(nW)', 'Where n is the number of items and W is the capacity. We fill a 2D table of size n×W.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440013', 'What is the space complexity of the longest common subsequence DP solution?', 'multiple_choice', 'O(mn)', 'Where m and n are the lengths of the two strings. We need a 2D table of size m×n.', 3, 3),
    
    -- UIL Contest Preparation - Time Management
    ('770e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440018', 'What is the recommended approach for time management in UIL contests?', 'multiple_choice', 'Read all problems first, then prioritize by difficulty', 'Reading all problems first helps you identify which ones you can solve quickly and which require more time.', 1, 1),
    ('770e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440018', 'How much time should you spend on a problem before moving on?', 'multiple_choice', 'Depends on the problem difficulty and remaining time', 'Time allocation should be flexible based on problem difficulty and overall contest progress.', 2, 1),
    ('770e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440018', 'What should you do if you are stuck on a problem?', 'multiple_choice', 'Move to another problem and come back later', 'Switching problems can provide fresh perspective and ensure you solve what you can.', 3, 1),
    
    -- UIL Problem Patterns - Simulation Problems
    ('770e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440023', 'What is the key to solving simulation problems?', 'multiple_choice', 'Follow the problem steps exactly as described', 'Simulation problems require careful step-by-step implementation of the given process.', 1, 1),
    ('770e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440023', 'What data structure is often useful for simulation problems?', 'multiple_choice', 'All of the above', 'Simulation problems may require arrays, queues, stacks, or other structures depending on the scenario.', 2, 1),
    ('770e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440023', 'What should you be careful about in simulation problems?', 'multiple_choice', 'Edge cases and boundary conditions', 'Simulation problems often have tricky edge cases that need careful handling.', 3, 1),

    -- UIL CS Fundamentals - Arrays & ArrayLists
    ('770e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440004', 'What is the output of: int[] arr = {1, 2, 3, 4, 5}; System.out.println(arr[arr.length - 1]);', 'multiple_choice', '5', 'arr.length is 5, so arr[arr.length - 1] = arr[4] = 5.', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440004', 'What is the output of: ArrayList<Integer> list = new ArrayList<>(); list.add(1); list.add(2); list.remove(0); System.out.println(list.get(0));', 'multiple_choice', '2', 'After adding 1,2 and removing index 0, the list contains [2].', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440004', 'What is the time complexity of inserting at the beginning of an ArrayList?', 'multiple_choice', 'O(n)', 'Inserting at the beginning requires shifting all elements, making it O(n).', 3, 2),

    -- UIL CS Fundamentals - String Processing
    ('770e8400-e29b-41d4-a716-446655440028', '660e8400-e29b-41d4-a716-446655440005', 'What is the output of: String s = "Hello World"; System.out.println(s.substring(6));', 'multiple_choice', 'World', 'substring(6) returns characters from index 6 to the end: "World".', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440029', '660e8400-e29b-41d4-a716-446655440005', 'What is the output of: String s = "Java"; System.out.println(s.charAt(s.length() - 1));', 'multiple_choice', 'a', 's.length() is 4, so s.charAt(3) returns the character at index 3: "a".', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440030', '660e8400-e29b-41d4-a716-446655440005', 'What is the output of: String s = "Hello"; System.out.println(s.indexOf("l"));', 'multiple_choice', '2', 'indexOf returns the first occurrence of "l" at index 2.', 3, 2),

    -- UIL CS Fundamentals - File I/O
    ('770e8400-e29b-41d4-a716-446655440031', '660e8400-e29b-41d4-a716-446655440006', 'What method is used to read the next line from a Scanner?', 'multiple_choice', 'nextLine()', 'nextLine() reads the entire line including spaces until the newline character.', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440032', '660e8400-e29b-41d4-a716-446655440006', 'What is the output of: Scanner sc = new Scanner("1 2 3"); System.out.println(sc.nextInt() + sc.nextInt());', 'multiple_choice', '3', 'nextInt() reads 1, then nextInt() reads 2, so 1 + 2 = 3.', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440033', '660e8400-e29b-41d4-a716-446655440006', 'What method checks if a Scanner has more tokens?', 'multiple_choice', 'hasNext()', 'hasNext() returns true if there are more tokens to read.', 3, 2),

    -- UIL Data Structures - Searching Algorithms
    ('770e8400-e29b-41d4-a716-446655440034', '660e8400-e29b-41d4-a716-446655440009', 'What is the time complexity of binary search on a sorted array?', 'multiple_choice', 'O(log n)', 'Binary search eliminates half the elements in each step, resulting in O(log n) time.', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440035', '660e8400-e29b-41d4-a716-446655440009', 'What is the prerequisite for binary search?', 'multiple_choice', 'The array must be sorted', 'Binary search requires the array to be sorted to work correctly.', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440036', '660e8400-e29b-41d4-a716-446655440009', 'What is the time complexity of linear search?', 'multiple_choice', 'O(n)', 'Linear search checks each element once, resulting in O(n) time complexity.', 3, 2),

    -- UIL Data Structures - Recursion
    ('770e8400-e29b-41d4-a716-446655440037', '660e8400-e29b-41d4-a716-446655440010', 'What is the base case in recursive Fibonacci?', 'multiple_choice', 'n <= 1', 'The base case for Fibonacci is when n is 0 or 1, returning n itself.', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440038', '660e8400-e29b-41d4-a716-446655440010', 'What is the time complexity of naive recursive Fibonacci?', 'multiple_choice', 'O(2^n)', 'Naive recursion recalculates the same values multiple times, leading to exponential time.', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440039', '660e8400-e29b-41d4-a716-446655440010', 'What is the space complexity of recursive factorial?', 'multiple_choice', 'O(n)', 'Each recursive call adds to the call stack, resulting in O(n) space complexity.', 3, 2),

    -- UIL Data Structures - Hash Tables & Sets
    ('770e8400-e29b-41d4-a716-446655440040', '660e8400-e29b-41d4-a716-446655440011', 'What is the average time complexity of HashMap operations?', 'multiple_choice', 'O(1)', 'HashMap provides average O(1) time for get, put, and remove operations.', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440041', '660e8400-e29b-41d4-a716-446655440011', 'What happens when you add a duplicate key to a HashMap?', 'multiple_choice', 'The value is updated', 'HashMap replaces the old value with the new value for duplicate keys.', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440042', '660e8400-e29b-41d4-a716-446655440011', 'What is the difference between HashMap and HashSet?', 'multiple_choice', 'HashMap stores key-value pairs, HashSet stores only keys', 'HashMap is for key-value mapping, HashSet is for unique value storage.', 3, 2),

    -- UIL Data Structures - Trees & Binary Trees
    ('770e8400-e29b-41d4-a716-446655440043', '660e8400-e29b-41d4-a716-446655440012', 'What is the maximum number of nodes in a binary tree of height h?', 'multiple_choice', '2^h - 1', 'A complete binary tree of height h has at most 2^h - 1 nodes.', 1, 2),
    ('770e8400-e29b-41d4-a716-446655440044', '660e8400-e29b-41d4-a716-446655440012', 'What is the time complexity of searching in a balanced binary search tree?', 'multiple_choice', 'O(log n)', 'In a balanced BST, each comparison eliminates half the remaining nodes.', 2, 2),
    ('770e8400-e29b-41d4-a716-446655440045', '660e8400-e29b-41d4-a716-446655440012', 'What are the three main tree traversal methods?', 'multiple_choice', 'Preorder, Inorder, Postorder', 'These are the three standard depth-first traversal methods for trees.', 3, 2),

    -- UIL Advanced Topics - Graph Algorithms (This was missing!)
    ('770e8400-e29b-41d4-a716-446655440046', '660e8400-e29b-41d4-a716-446655440014', 'What data structure is used to implement BFS?', 'multiple_choice', 'Queue', 'BFS uses a queue to process nodes level by level.', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440047', '660e8400-e29b-41d4-a716-446655440014', 'What data structure is used to implement DFS?', 'multiple_choice', 'Stack', 'DFS uses a stack (either explicit or implicit via recursion) to go deep first.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440048', '660e8400-e29b-41d4-a716-446655440014', 'What is the time complexity of Dijkstra''s algorithm?', 'multiple_choice', 'O((V + E) log V)', 'With a binary heap, Dijkstra''s algorithm has O((V + E) log V) time complexity.', 3, 3),
    ('770e8400-e29b-41d4-a716-446655440049', '660e8400-e29b-41d4-a716-446655440014', 'What is the time complexity of BFS on a graph?', 'multiple_choice', 'O(V + E)', 'BFS visits each vertex and edge exactly once, resulting in O(V + E) time.', 4, 2),

    -- UIL Advanced Topics - Greedy Algorithms
    ('770e8400-e29b-41d4-a716-446655440050', '660e8400-e29b-41d4-a716-446655440015', 'What is the greedy choice property?', 'multiple_choice', 'A locally optimal choice leads to a globally optimal solution', 'Greedy algorithms make the best choice at each step hoping it leads to the optimal solution.', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440051', '660e8400-e29b-41d4-a716-446655440015', 'Which problem is a classic example of greedy algorithms?', 'multiple_choice', 'Activity Selection Problem', 'Activity selection is a classic greedy problem where we choose non-overlapping activities.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440052', '660e8400-e29b-41d4-a716-446655440015', 'What is the time complexity of the greedy fractional knapsack?', 'multiple_choice', 'O(n log n)', 'We need to sort items by value-to-weight ratio, which takes O(n log n) time.', 3, 3),

    -- UIL Advanced Topics - Number Theory
    ('770e8400-e29b-41d4-a716-446655440053', '660e8400-e29b-41d4-a716-446655440016', 'What is the GCD of 48 and 18?', 'multiple_choice', '6', 'Using Euclidean algorithm: GCD(48, 18) = GCD(18, 12) = GCD(12, 6) = GCD(6, 0) = 6.', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440054', '660e8400-e29b-41d4-a716-446655440016', 'What is the LCM of 12 and 18?', 'multiple_choice', '36', 'LCM(12, 18) = (12 × 18) / GCD(12, 18) = 216 / 6 = 36.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440055', '660e8400-e29b-41d4-a716-446655440016', 'What is the time complexity of checking if a number is prime?', 'multiple_choice', 'O(√n)', 'We only need to check divisors up to √n to determine if n is prime.', 3, 3),

    -- UIL Advanced Topics - Advanced Data Structures
    ('770e8400-e29b-41d4-a716-446655440056', '660e8400-e29b-41d4-a716-446655440017', 'What is the time complexity of inserting into a priority queue?', 'multiple_choice', 'O(log n)', 'Priority queue insertion takes O(log n) time to maintain the heap property.', 1, 3),
    ('770e8400-e29b-41d4-a716-446655440057', '660e8400-e29b-41d4-a716-446655440017', 'What is the time complexity of range sum query in a segment tree?', 'multiple_choice', 'O(log n)', 'Segment tree allows range queries in O(log n) time by traversing the tree.', 2, 3),
    ('770e8400-e29b-41d4-a716-446655440058', '660e8400-e29b-41d4-a716-446655440017', 'What is a Fenwick tree used for?', 'multiple_choice', 'Range sum queries and point updates', 'Fenwick tree efficiently handles range sum queries and point updates in O(log n).', 3, 3);

-- Insert question options for UIL CS questions
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES
    -- Question 1 options (Java Basics)
    ('770e8400-e29b-41d4-a716-446655440001', '12', true, 1),
    ('770e8400-e29b-41d4-a716-446655440001', '10', false, 2),
    ('770e8400-e29b-41d4-a716-446655440001', '11', false, 3),
    ('770e8400-e29b-41d4-a716-446655440001', '13', false, 4),
    
    -- Question 2 options (Java Basics)
    ('770e8400-e29b-41d4-a716-446655440002', 'false', true, 1),
    ('770e8400-e29b-41d4-a716-446655440002', 'true', false, 2),
    ('770e8400-e29b-41d4-a716-446655440002', 'Hello', false, 3),
    ('770e8400-e29b-41d4-a716-446655440002', 'Error', false, 4),
    
    -- Question 3 options (Java Basics)
    ('770e8400-e29b-41d4-a716-446655440003', 'Infinity', true, 1),
    ('770e8400-e29b-41d4-a716-446655440003', 'NaN', false, 2),
    ('770e8400-e29b-41d4-a716-446655440003', 'Exception', false, 3),
    ('770e8400-e29b-41d4-a716-446655440003', '0', false, 4),
    
    -- Question 4 options (Control Flow)
    ('770e8400-e29b-41d4-a716-446655440004', '012', true, 1),
    ('770e8400-e29b-41d4-a716-446655440004', '123', false, 2),
    ('770e8400-e29b-41d4-a716-446655440004', '0123', false, 3),
    ('770e8400-e29b-41d4-a716-446655440004', '0 1 2', false, 4),
    
    -- Question 5 options (Control Flow)
    ('770e8400-e29b-41d4-a716-446655440005', 'for loop', true, 1),
    ('770e8400-e29b-41d4-a716-446655440005', 'while loop', false, 2),
    ('770e8400-e29b-41d4-a716-446655440005', 'do-while loop', false, 3),
    ('770e8400-e29b-41d4-a716-446655440005', 'enhanced for loop', false, 4),
    
    -- Question 6 options (Control Flow)
    ('770e8400-e29b-41d4-a716-446655440006', 'true', false, 1),
    ('770e8400-e29b-41d4-a716-446655440006', 'false', true, 2),
    ('770e8400-e29b-41d4-a716-446655440006', 'Error', false, 3),
    ('770e8400-e29b-41d4-a716-446655440006', 'null', false, 4),
    
    -- Question 7 options (Methods)
    ('770e8400-e29b-41d4-a716-446655440007', 'void', true, 1),
    ('770e8400-e29b-41d4-a716-446655440007', 'null', false, 2),
    ('770e8400-e29b-41d4-a716-446655440007', 'empty', false, 3),
    ('770e8400-e29b-41d4-a716-446655440007', 'none', false, 4),
    
    -- Question 8 options (Methods)
    ('770e8400-e29b-41d4-a716-446655440008', 'Only within the method where it is declared', true, 1),
    ('770e8400-e29b-41d4-a716-446655440008', 'Throughout the entire class', false, 2),
    ('770e8400-e29b-41d4-a716-446655440008', 'Throughout the entire program', false, 3),
    ('770e8400-e29b-41d4-a716-446655440008', 'Only within the block where it is declared', false, 4),
    
    -- Question 10 options (Data Structures)
    ('770e8400-e29b-41d4-a716-446655440010', 'O(1)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440010', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440010', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440010', 'O(n²)', false, 4),
    
    -- Question 11 options (Data Structures)
    ('770e8400-e29b-41d4-a716-446655440011', 'Queue', false, 1),
    ('770e8400-e29b-41d4-a716-446655440011', 'Stack', true, 2),
    ('770e8400-e29b-41d4-a716-446655440011', 'Array', false, 3),
    ('770e8400-e29b-41d4-a716-446655440011', 'Linked List', false, 4),
    
    -- Question 12 options (Data Structures)
    ('770e8400-e29b-41d4-a716-446655440012', 'O(1)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440012', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440012', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440012', 'O(n²)', false, 4),
    
    -- Question 13 options (Sorting)
    ('770e8400-e29b-41d4-a716-446655440013', 'O(n)', false, 1),
    ('770e8400-e29b-41d4-a716-446655440013', 'O(n log n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440013', 'O(n²)', true, 3),
    ('770e8400-e29b-41d4-a716-446655440013', 'O(1)', false, 4),
    
    -- Question 14 options (Sorting)
    ('770e8400-e29b-41d4-a716-446655440014', 'Bubble Sort', false, 1),
    ('770e8400-e29b-41d4-a716-446655440014', 'Selection Sort', false, 2),
    ('770e8400-e29b-41d4-a716-446655440014', 'Merge Sort', true, 3),
    ('770e8400-e29b-41d4-a716-446655440014', 'Insertion Sort', false, 4),
    
    -- Question 15 options (Sorting)
    ('770e8400-e29b-41d4-a716-446655440015', 'O(1)', false, 1),
    ('770e8400-e29b-41d4-a716-446655440015', 'O(n)', true, 2),
    ('770e8400-e29b-41d4-a716-446655440015', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440015', 'O(n²)', false, 4),
    
    -- Question 16 options (Dynamic Programming)
    ('770e8400-e29b-41d4-a716-446655440016', 'Solve subproblems and store results to avoid recomputation', true, 1),
    ('770e8400-e29b-41d4-a716-446655440016', 'Use recursion without memoization', false, 2),
    ('770e8400-e29b-41d4-a716-446655440016', 'Always use greedy approach', false, 3),
    ('770e8400-e29b-41d4-a716-446655440016', 'Avoid recursion completely', false, 4),
    
    -- Question 17 options (Dynamic Programming)
    ('770e8400-e29b-41d4-a716-446655440017', 'O(n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440017', 'O(2^n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440017', 'O(n²)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440017', 'O(log n)', false, 4),
    
    -- Question 18 options (Dynamic Programming)
    ('770e8400-e29b-41d4-a716-446655440018', 'O(mn)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440018', 'O(m+n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440018', 'O(m²)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440018', 'O(n²)', false, 4),
    
    -- Question 19 options (Time Management)
    ('770e8400-e29b-41d4-a716-446655440019', 'Read all problems first, then prioritize by difficulty', true, 1),
    ('770e8400-e29b-41d4-a716-446655440019', 'Start with the first problem', false, 2),
    ('770e8400-e29b-41d4-a716-446655440019', 'Start with the hardest problem', false, 3),
    ('770e8400-e29b-41d4-a716-446655440019', 'Randomly pick problems', false, 4),
    
    -- Question 20 options (Time Management)
    ('770e8400-e29b-41d4-a716-446655440020', 'Exactly 10 minutes per problem', false, 1),
    ('770e8400-e29b-41d4-a716-446655440020', 'Depends on the problem difficulty and remaining time', true, 2),
    ('770e8400-e29b-41d4-a716-446655440020', 'Spend all time on one problem', false, 3),
    ('770e8400-e29b-41d4-a716-446655440020', '5 minutes maximum per problem', false, 4),
    
    -- Question 21 options (Time Management)
    ('770e8400-e29b-41d4-a716-446655440021', 'Keep trying the same approach', false, 1),
    ('770e8400-e29b-41d4-a716-446655440021', 'Move to another problem and come back later', true, 2),
    ('770e8400-e29b-41d4-a716-446655440021', 'Give up completely', false, 3),
    ('770e8400-e29b-41d4-a716-446655440021', 'Ask for help', false, 4),
    
    -- Question 22 options (Simulation Problems)
    ('770e8400-e29b-41d4-a716-446655440022', 'Follow the problem steps exactly as described', true, 1),
    ('770e8400-e29b-41d4-a716-446655440022', 'Skip some steps to save time', false, 2),
    ('770e8400-e29b-41d4-a716-446655440022', 'Modify the problem requirements', false, 3),
    ('770e8400-e29b-41d4-a716-446655440022', 'Use a different algorithm', false, 4),
    
    -- Question 23 options (Simulation Problems)
    ('770e8400-e29b-41d4-a716-446655440023', 'Arrays', false, 1),
    ('770e8400-e29b-41d4-a716-446655440023', 'Queues', false, 2),
    ('770e8400-e29b-41d4-a716-446655440023', 'Stacks', false, 3),
    ('770e8400-e29b-41d4-a716-446655440023', 'All of the above', true, 4),
    
    -- Question 24 options (Simulation Problems)
    ('770e8400-e29b-41d4-a716-446655440024', 'Edge cases and boundary conditions', true, 1),
    ('770e8400-e29b-41d4-a716-446655440024', 'Only the main algorithm', false, 2),
    ('770e8400-e29b-41d4-a716-446655440024', 'Input validation only', false, 3),
    ('770e8400-e29b-41d4-a716-446655440024', 'Output formatting only', false, 4),

    -- Question 25-27 options (Arrays & ArrayLists)
    ('770e8400-e29b-41d4-a716-446655440025', '5', true, 1),
    ('770e8400-e29b-41d4-a716-446655440025', '4', false, 2),
    ('770e8400-e29b-41d4-a716-446655440025', 'Error', false, 3),
    ('770e8400-e29b-41d4-a716-446655440025', '1', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440026', '2', true, 1),
    ('770e8400-e29b-41d4-a716-446655440026', '1', false, 2),
    ('770e8400-e29b-41d4-a716-446655440026', 'Error', false, 3),
    ('770e8400-e29b-41d4-a716-446655440026', '0', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440027', 'O(n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440027', 'O(1)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440027', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440027', 'O(n²)', false, 4),

    -- Question 28-30 options (String Processing)
    ('770e8400-e29b-41d4-a716-446655440028', 'World', true, 1),
    ('770e8400-e29b-41d4-a716-446655440028', 'Hello', false, 2),
    ('770e8400-e29b-41d4-a716-446655440028', 'Hello World', false, 3),
    ('770e8400-e29b-41d4-a716-446655440028', 'Error', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440029', 'a', true, 1),
    ('770e8400-e29b-41d4-a716-446655440029', 'J', false, 2),
    ('770e8400-e29b-41d4-a716-446655440029', 'v', false, 3),
    ('770e8400-e29b-41d4-a716-446655440029', 'Error', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440030', '2', true, 1),
    ('770e8400-e29b-41d4-a716-446655440030', '3', false, 2),
    ('770e8400-e29b-41d4-a716-446655440030', '1', false, 3),
    ('770e8400-e29b-41d4-a716-446655440030', '-1', false, 4),

    -- Question 31-33 options (File I/O)
    ('770e8400-e29b-41d4-a716-446655440031', 'nextLine()', true, 1),
    ('770e8400-e29b-41d4-a716-446655440031', 'next()', false, 2),
    ('770e8400-e29b-41d4-a716-446655440031', 'nextInt()', false, 3),
    ('770e8400-e29b-41d4-a716-446655440031', 'readLine()', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440032', '3', true, 1),
    ('770e8400-e29b-41d4-a716-446655440032', '1', false, 2),
    ('770e8400-e29b-41d4-a716-446655440032', '2', false, 3),
    ('770e8400-e29b-41d4-a716-446655440032', 'Error', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440033', 'hasNext()', true, 1),
    ('770e8400-e29b-41d4-a716-446655440033', 'hasNextLine()', false, 2),
    ('770e8400-e29b-41d4-a716-446655440033', 'hasNextInt()', false, 3),
    ('770e8400-e29b-41d4-a716-446655440033', 'isNext()', false, 4),

    -- Question 34-36 options (Searching Algorithms)
    ('770e8400-e29b-41d4-a716-446655440034', 'O(log n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440034', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440034', 'O(n²)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440034', 'O(1)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440035', 'The array must be sorted', true, 1),
    ('770e8400-e29b-41d4-a716-446655440035', 'The array must be unsorted', false, 2),
    ('770e8400-e29b-41d4-a716-446655440035', 'The array must be unique', false, 3),
    ('770e8400-e29b-41d4-a716-446655440035', 'No prerequisites', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440036', 'O(n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440036', 'O(log n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440036', 'O(1)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440036', 'O(n²)', false, 4),

    -- Question 37-39 options (Recursion)
    ('770e8400-e29b-41d4-a716-446655440037', 'n <= 1', true, 1),
    ('770e8400-e29b-41d4-a716-446655440037', 'n == 0', false, 2),
    ('770e8400-e29b-41d4-a716-446655440037', 'n == 1', false, 3),
    ('770e8400-e29b-41d4-a716-446655440037', 'n < 0', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440038', 'O(2^n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440038', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440038', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440038', 'O(n²)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440039', 'O(n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440039', 'O(1)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440039', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440039', 'O(2^n)', false, 4),

    -- Question 40-42 options (Hash Tables & Sets)
    ('770e8400-e29b-41d4-a716-446655440040', 'O(1)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440040', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440040', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440040', 'O(n²)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440041', 'The value is updated', true, 1),
    ('770e8400-e29b-41d4-a716-446655440041', 'An error occurs', false, 2),
    ('770e8400-e29b-41d4-a716-446655440041', 'The key is ignored', false, 3),
    ('770e8400-e29b-41d4-a716-446655440041', 'A new entry is created', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440042', 'HashMap stores key-value pairs, HashSet stores only keys', true, 1),
    ('770e8400-e29b-41d4-a716-446655440042', 'HashMap stores only keys, HashSet stores key-value pairs', false, 2),
    ('770e8400-e29b-41d4-a716-446655440042', 'They are identical', false, 3),
    ('770e8400-e29b-41d4-a716-446655440042', 'HashMap is faster than HashSet', false, 4),

    -- Question 43-45 options (Trees & Binary Trees)
    ('770e8400-e29b-41d4-a716-446655440043', '2^h - 1', true, 1),
    ('770e8400-e29b-41d4-a716-446655440043', '2^h', false, 2),
    ('770e8400-e29b-41d4-a716-446655440043', 'h^2', false, 3),
    ('770e8400-e29b-41d4-a716-446655440043', 'h + 1', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440044', 'O(log n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440044', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440044', 'O(1)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440044', 'O(n²)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440045', 'Preorder, Inorder, Postorder', true, 1),
    ('770e8400-e29b-41d4-a716-446655440045', 'BFS, DFS, Level-order', false, 2),
    ('770e8400-e29b-41d4-a716-446655440045', 'Left, Right, Root', false, 3),
    ('770e8400-e29b-41d4-a716-446655440045', 'Top, Middle, Bottom', false, 4),

    -- Question 46-49 options (Graph Algorithms - The missing ones!)
    ('770e8400-e29b-41d4-a716-446655440046', 'Queue', true, 1),
    ('770e8400-e29b-41d4-a716-446655440046', 'Stack', false, 2),
    ('770e8400-e29b-41d4-a716-446655440046', 'Array', false, 3),
    ('770e8400-e29b-41d4-a716-446655440046', 'HashMap', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440047', 'Stack', true, 1),
    ('770e8400-e29b-41d4-a716-446655440047', 'Queue', false, 2),
    ('770e8400-e29b-41d4-a716-446655440047', 'Array', false, 3),
    ('770e8400-e29b-41d4-a716-446655440047', 'HashMap', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440048', 'O((V + E) log V)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440048', 'O(V + E)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440048', 'O(V²)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440048', 'O(E log V)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440049', 'O(V + E)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440049', 'O(V log E)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440049', 'O(V²)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440049', 'O(E log V)', false, 4),

    -- Question 50-52 options (Greedy Algorithms)
    ('770e8400-e29b-41d4-a716-446655440050', 'A locally optimal choice leads to a globally optimal solution', true, 1),
    ('770e8400-e29b-41d4-a716-446655440050', 'Always choose the largest element', false, 2),
    ('770e8400-e29b-41d4-a716-446655440050', 'Never use recursion', false, 3),
    ('770e8400-e29b-41d4-a716-446655440050', 'Always sort the input first', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440051', 'Activity Selection Problem', true, 1),
    ('770e8400-e29b-41d4-a716-446655440051', 'Knapsack Problem', false, 2),
    ('770e8400-e29b-41d4-a716-446655440051', 'Longest Common Subsequence', false, 3),
    ('770e8400-e29b-41d4-a716-446655440051', 'Fibonacci Sequence', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440052', 'O(n log n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440052', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440052', 'O(n²)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440052', 'O(2^n)', false, 4),

    -- Question 53-55 options (Number Theory)
    ('770e8400-e29b-41d4-a716-446655440053', '6', true, 1),
    ('770e8400-e29b-41d4-a716-446655440053', '3', false, 2),
    ('770e8400-e29b-41d4-a716-446655440053', '12', false, 3),
    ('770e8400-e29b-41d4-a716-446655440053', '18', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440054', '36', true, 1),
    ('770e8400-e29b-41d4-a716-446655440054', '24', false, 2),
    ('770e8400-e29b-41d4-a716-446655440054', '48', false, 3),
    ('770e8400-e29b-41d4-a716-446655440054', '72', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440055', 'O(√n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440055', 'O(n)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440055', 'O(log n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440055', 'O(1)', false, 4),

    -- Question 56-58 options (Advanced Data Structures)
    ('770e8400-e29b-41d4-a716-446655440056', 'O(log n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440056', 'O(1)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440056', 'O(n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440056', 'O(n²)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440057', 'O(log n)', true, 1),
    ('770e8400-e29b-41d4-a716-446655440057', 'O(1)', false, 2),
    ('770e8400-e29b-41d4-a716-446655440057', 'O(n)', false, 3),
    ('770e8400-e29b-41d4-a716-446655440057', 'O(n²)', false, 4),
    
    ('770e8400-e29b-41d4-a716-446655440058', 'Range sum queries and point updates', true, 1),
    ('770e8400-e29b-41d4-a716-446655440058', 'String pattern matching', false, 2),
    ('770e8400-e29b-41d4-a716-446655440058', 'Graph traversal', false, 3),
    ('770e8400-e29b-41d4-a716-446655440058', 'Sorting algorithms', false, 4);

-- Insert sample problems
INSERT INTO problems (id, title, description, difficulty_level, category, points, time_limit, memory_limit, programming_language, categories) VALUES
    -- Beginner Level Problems
    ('880e8400-e29b-41d4-a716-446655440001', 'Sum of Two Numbers', 'Given two integers, calculate and return their sum.', 1, 'Basic Math', 50, 1000, 25, 'java', 'Basic Math,Arithmetic'),
    ('880e8400-e29b-41d4-a716-446655440002', 'Even or Odd', 'Given an integer, determine if it is even or odd.', 1, 'Conditionals', 50, 1000, 25, 'java', 'Conditionals,Modulo'),
    ('880e8400-e29b-41d4-a716-446655440003', 'Array Sum', 'Calculate the sum of all elements in an array of integers.', 1, 'Arrays', 75, 1500, 25, 'java', 'Arrays,Loops'),
    ('880e8400-e29b-41d4-a716-446655440004', 'String Length', 'Given a string, return its length without using the length() method.', 1, 'Strings', 75, 1500, 25, 'java', 'Strings,Loops'),
    ('880e8400-e29b-41d4-a716-446655440005', 'Factorial', 'Calculate the factorial of a given non-negative integer.', 1, 'Recursion', 100, 2000, 50, 'java', 'Recursion,Math'),
    
    -- Intermediate Level Problems
    ('880e8400-e29b-41d4-a716-446655440006', 'Two Sum', 'Given an array of integers and a target sum, find two numbers that add up to the target.', 2, 'Arrays', 150, 2000, 50, 'java', 'Arrays,Hash Table'),
    ('880e8400-e29b-41d4-a716-446655440007', 'Palindrome Check', 'Determine if a given string is a palindrome (reads the same forwards and backwards).', 2, 'Strings', 150, 2000, 50, 'java', 'Strings,Two Pointers'),
    ('880e8400-e29b-41d4-a716-446655440008', 'Binary Search', 'Implement binary search to find a target value in a sorted array.', 2, 'Search', 150, 2000, 50, 'java', 'Binary Search,Arrays'),
    ('880e8400-e29b-41d4-a716-446655440009', 'Bubble Sort', 'Implement the bubble sort algorithm to sort an array of integers.', 2, 'Sorting', 150, 3000, 50, 'java', 'Sorting,Arrays'),
    ('880e8400-e29b-41d4-a716-446655440010', 'Stack Operations', 'Implement basic stack operations (push, pop, peek) using an array.', 2, 'Data Structures', 150, 2000, 50, 'java', 'Stack,Arrays'),
    
    -- Advanced Level Problems
    ('880e8400-e29b-41d4-a716-446655440011', 'Merge Sort', 'Implement the merge sort algorithm to sort an array of integers.', 3, 'Sorting', 200, 5000, 100, 'java', 'Sorting,Divide and Conquer'),
    ('880e8400-e29b-41d4-a716-446655440012', 'Longest Common Subsequence', 'Find the length of the longest common subsequence between two strings.', 3, 'Dynamic Programming', 250, 5000, 100, 'java', 'Dynamic Programming,Strings'),
    ('880e8400-e29b-41d4-a716-446655440013', 'Graph Traversal', 'Implement depth-first search (DFS) on a graph represented as an adjacency list.', 3, 'Graphs', 250, 5000, 100, 'java', 'Graphs,DFS,Recursion'),
    ('880e8400-e29b-41d4-a716-446655440014', 'Dijkstra''s Algorithm', 'Find the shortest path from a source vertex to all other vertices in a weighted graph.', 3, 'Graphs', 300, 5000, 100, 'java', 'Graphs,Shortest Path,Priority Queue'),
    ('880e8400-e29b-41d4-a716-446655440015', 'Knapsack Problem', 'Solve the 0/1 knapsack problem using dynamic programming.', 3, 'Dynamic Programming', 300, 5000, 100, 'java', 'Dynamic Programming,Optimization'),
    
    -- UIL Contest Style Problems
    ('880e8400-e29b-41d4-a716-446655440016', 'Number Guessing Game', 'Implement a number guessing game where the computer guesses a number between 1 and 100.', 2, 'Simulation', 150, 2000, 50, 'java', 'Simulation,Binary Search'),
    ('880e8400-e29b-41d4-a716-446655440017', 'Tic-Tac-Toe Checker', 'Given a 3x3 grid, determine if there is a winner in a game of tic-tac-toe.', 2, 'Simulation', 150, 2000, 50, 'java', 'Simulation,Arrays'),
    ('880e8400-e29b-41d4-a716-446655440018', 'Prime Number Generator', 'Generate all prime numbers up to a given limit using the Sieve of Eratosthenes.', 2, 'Number Theory', 150, 3000, 50, 'java', 'Number Theory,Primes'),
    ('880e8400-e29b-41d4-a716-446655440019', 'String Permutations', 'Generate all permutations of a given string.', 3, 'Recursion', 200, 3000, 100, 'java', 'Recursion,Strings,Backtracking'),
    ('880e8400-e29b-41d4-a716-446655440020', 'Matrix Multiplication', 'Implement matrix multiplication for two 2D arrays.', 2, 'Arrays', 150, 3000, 50, 'java', 'Arrays,Matrices,Math');

-- Insert test cases for Two Sum problem
INSERT INTO test_cases (problem_id, input_data, expected_output, is_hidden, order_index) VALUES
    ('880e8400-e29b-41d4-a716-446655440001', '{"nums": [2, 7, 11, 15], "target": 9}', '[0, 1]', false, 1),
    ('880e8400-e29b-41d4-a716-446655440001', '{"nums": [3, 2, 4], "target": 6}', '[1, 2]', false, 2),
    ('880e8400-e29b-41d4-a716-446655440001', '{"nums": [3, 3], "target": 6}', '[0, 1]', false, 3),
    ('880e8400-e29b-41d4-a716-446655440001', '{"nums": [1, 2, 3, 4, 5], "target": 8}', '[2, 4]', true, 4);

-- Insert test cases for Palindrome Check problem
INSERT INTO test_cases (problem_id, input_data, expected_output, is_hidden, order_index) VALUES
    ('880e8400-e29b-41d4-a716-446655440002', '{"s": "racecar"}', 'true', false, 1),
    ('880e8400-e29b-41d4-a716-446655440002', '{"s": "hello"}', 'false', false, 2),
    ('880e8400-e29b-41d4-a716-446655440002', '{"s": "A man a plan a canal Panama"}', 'true', false, 3),
    ('880e8400-e29b-41d4-a716-446655440002', '{"s": "race a car"}', 'false', true, 4);

-- Insert test cases for Fibonacci problem
INSERT INTO test_cases (problem_id, input_data, expected_output, is_hidden, order_index) VALUES
    ('880e8400-e29b-41d4-a716-446655440003', '{"n": 0}', '0', false, 1),
    ('880e8400-e29b-41d4-a716-446655440003', '{"n": 1}', '1', false, 2),
    ('880e8400-e29b-41d4-a716-446655440003', '{"n": 5}', '5', false, 3),
    ('880e8400-e29b-41d4-a716-446655440003', '{"n": 10}', '55', true, 4);

-- =====================================================
-- PART 8: CREATE USER AUTO-CREATION TRIGGER
-- =====================================================

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This script has completed successfully!
-- Your UIL CS Academy database is now fully set up with:
-- ✅ All existing tables dropped and recreated cleanly
-- ✅ All required tables created with proper relationships
-- ✅ Row Level Security enabled
-- ✅ Security policies configured
-- ✅ Sample data inserted
-- ✅ Performance indexes created
-- ✅ Trigger functions set up
-- ✅ Auto user creation trigger configured

-- You can now test your application at: http://localhost:3000/api/test-supabase
