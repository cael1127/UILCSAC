-- Create Learning Paths System for UIL CS Academy
-- Structured progression from Java basics to advanced algorithms

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

-- Get the learning path ID
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
