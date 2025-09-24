-- =====================================================
-- PHASE 1: UIL ACADEMY MULTI-SUBJECT EXPANSION
-- =====================================================
-- This script sets up the UIL Academy multi-subject database
-- to support all UIL subjects (Math, Science, Literature, Spelling, etc.)

-- =====================================================
-- PART 1: ADD SUBJECTS SYSTEM
-- =====================================================

-- Subjects table - Core UIL subject areas
CREATE TABLE IF NOT EXISTS subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- Lucide icon name for UI
    color_theme TEXT DEFAULT 'blue', -- Theme color for subject branding
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subject resources table - Reference materials per subject
CREATE TABLE IF NOT EXISTS subject_resources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT CHECK (resource_type IN ('glossary', 'formula_sheet', 'reference_guide', 'practice_guide')),
    content TEXT, -- JSON or markdown content
    file_url TEXT, -- Optional file attachment
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 2: MODIFY EXISTING TABLES FOR MULTI-SUBJECT
-- =====================================================

-- Add subject_id to learning_paths table
ALTER TABLE learning_paths 
ADD COLUMN IF NOT EXISTS subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE;

-- Add subject-specific metadata to learning_paths
ALTER TABLE learning_paths 
ADD COLUMN IF NOT EXISTS prerequisites TEXT[], -- Array of prerequisite topics
ADD COLUMN IF NOT EXISTS learning_objectives TEXT[], -- Array of learning objectives
ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of tags for filtering

-- Enhance questions table for multi-subject support
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('text', 'image', 'audio', 'video', 'latex')),
ADD COLUMN IF NOT EXISTS media_url TEXT, -- URL to media file
ADD COLUMN IF NOT EXISTS media_metadata JSONB, -- Additional media properties
ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER, -- For timed questions
ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5);

-- Enhance question types for different subjects
ALTER TABLE questions 
DROP CONSTRAINT IF EXISTS questions_question_type_check;

ALTER TABLE questions 
ADD CONSTRAINT questions_question_type_check 
CHECK (question_type IN (
    'multiple_choice', 
    'written_response', 
    'code_completion',
    'short_answer',
    'essay',
    'dictation', -- For spelling
    'calculation', -- For math
    'formula_derivation', -- For science/math
    'text_analysis', -- For literature
    'matching',
    'true_false',
    'fill_in_blank'
));

-- =====================================================
-- PART 3: PRACTICE TESTS SYSTEM
-- =====================================================

-- Practice tests table - Mock UIL exams
CREATE TABLE IF NOT EXISTS practice_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    test_type TEXT CHECK (test_type IN ('practice', 'mock_exam', 'diagnostic', 'review')),
    time_limit_minutes INTEGER,
    total_points INTEGER DEFAULT 0,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice test questions - Links questions to tests
CREATE TABLE IF NOT EXISTS practice_test_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    practice_test_id UUID REFERENCES practice_tests(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(practice_test_id, question_id)
);

-- User practice test attempts
CREATE TABLE IF NOT EXISTS user_practice_test_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    practice_test_id UUID REFERENCES practice_tests(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 4: ENHANCED USER PROGRESS TRACKING
-- =====================================================

-- Subject-level user progress
CREATE TABLE IF NOT EXISTS user_subject_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    total_learning_paths INTEGER DEFAULT 0,
    completed_learning_paths INTEGER DEFAULT 0,
    total_practice_tests INTEGER DEFAULT 0,
    completed_practice_tests INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_id)
);

-- =====================================================
-- PART 5: SEED INITIAL SUBJECTS
-- =====================================================

-- Insert core UIL subjects
INSERT INTO subjects (name, display_name, description, icon_name, color_theme, sort_order) VALUES
('computer_science', 'Computer Science', 'Java programming, algorithms, and data structures for UIL CS competitions', 'Code', 'blue', 1),
('mathematics', 'Mathematics', 'Number Sense, Calculator Applications, and General Math', 'Calculator', 'green', 2),
('science', 'Science', 'Biology, Chemistry, Physics, and Earth Science', 'Atom', 'purple', 3),
('literature', 'Literature Criticism', 'Literary analysis, major works, and critical thinking', 'BookOpen', 'orange', 4),
('spelling', 'Spelling & Vocabulary', 'Word lists, etymology, and pronunciation practice', 'Spellcheck', 'pink', 5)
ON CONFLICT (name) DO NOTHING;

-- Link existing Computer Science learning paths to CS subject
UPDATE learning_paths 
SET subject_id = (SELECT id FROM subjects WHERE name = 'computer_science')
WHERE subject_id IS NULL;

-- =====================================================
-- PART 6: UPDATE RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subject_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects (public read)
CREATE POLICY "Subjects are viewable by everyone" ON subjects
    FOR SELECT USING (is_active = true);

-- RLS Policies for subject_resources (public read)
CREATE POLICY "Subject resources are viewable by everyone" ON subject_resources
    FOR SELECT USING (is_active = true);

-- RLS Policies for practice_tests (public read)
CREATE POLICY "Practice tests are viewable by everyone" ON practice_tests
    FOR SELECT USING (is_active = true);

-- RLS Policies for practice_test_questions (public read)
CREATE POLICY "Practice test questions are viewable by everyone" ON practice_test_questions
    FOR SELECT USING (true);

-- RLS Policies for user_practice_test_attempts (user-specific)
CREATE POLICY "Users can view their own practice test attempts" ON user_practice_test_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice test attempts" ON user_practice_test_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice test attempts" ON user_practice_test_attempts
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_subject_progress (user-specific)
CREATE POLICY "Users can view their own subject progress" ON user_subject_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subject progress" ON user_subject_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subject progress" ON user_subject_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- PART 7: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learning_paths_subject_id ON learning_paths(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_resources_subject_id ON subject_resources(subject_id);
CREATE INDEX IF NOT EXISTS idx_practice_tests_subject_id ON practice_tests(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_subject_progress_user_subject ON user_subject_progress(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_media_type ON questions(media_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);

-- =====================================================
-- PART 8: UPDATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update user subject progress
CREATE OR REPLACE FUNCTION update_user_subject_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update subject progress when learning path progress changes
    INSERT INTO user_subject_progress (user_id, subject_id, last_accessed)
    SELECT 
        NEW.user_id,
        lp.subject_id,
        NOW()
    FROM learning_paths lp
    WHERE lp.id = NEW.learning_path_id
    ON CONFLICT (user_id, subject_id) 
    DO UPDATE SET 
        last_accessed = NOW(),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update subject progress
DROP TRIGGER IF EXISTS trigger_update_subject_progress ON user_learning_progress;
CREATE TRIGGER trigger_update_subject_progress
    AFTER INSERT OR UPDATE ON user_learning_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subject_progress();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the setup
DO $$
BEGIN
    RAISE NOTICE 'UIL Academy Multi-Subject Expansion Complete!';
    RAISE NOTICE 'Subjects created: %', (SELECT COUNT(*) FROM subjects);
    RAISE NOTICE 'Learning paths linked: %', (SELECT COUNT(*) FROM learning_paths WHERE subject_id IS NOT NULL);
    RAISE NOTICE 'New tables created: subjects, subject_resources, practice_tests, practice_test_questions, user_practice_test_attempts, user_subject_progress';
    RAISE NOTICE 'Enhanced question types: %, %, %, %, %, %, %, %, %, %, %', 
        'multiple_choice', 'written_response', 'code_completion', 'short_answer', 'essay', 
        'dictation', 'calculation', 'formula_derivation', 'text_analysis', 'matching', 'true_false';
END $$;
