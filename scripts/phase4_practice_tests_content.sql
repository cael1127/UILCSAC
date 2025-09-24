-- =====================================================
-- PHASE 4: PRACTICE TESTS CONTENT CREATION
-- =====================================================
-- This script creates sample practice tests for all UIL subjects

DO $$
DECLARE
    cs_subject_id UUID;
    math_subject_id UUID;
    science_subject_id UUID;
    literature_subject_id UUID;
    spelling_subject_id UUID;
    
    -- Practice Test IDs
    cs_mock_exam_id UUID;
    math_number_sense_id UUID;
    science_biology_id UUID;
    literature_terms_id UUID;
    spelling_basics_id UUID;
    
    -- Sample question IDs (we'll use existing questions)
    sample_question_ids UUID[];
    
BEGIN
    -- Get subject IDs
    SELECT id INTO cs_subject_id FROM subjects WHERE name = 'computer_science';
    SELECT id INTO math_subject_id FROM subjects WHERE name = 'mathematics';
    SELECT id INTO science_subject_id FROM subjects WHERE name = 'science';
    SELECT id INTO literature_subject_id FROM subjects WHERE name = 'literature';
    SELECT id INTO spelling_subject_id FROM subjects WHERE name = 'spelling';
    
    -- =====================================================
    -- COMPUTER SCIENCE PRACTICE TESTS
    -- =====================================================
    
    -- CS Mock Exam
    INSERT INTO practice_tests (
        id, subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        uuid_generate_v4(), cs_subject_id,
        'UIL Computer Science Mock Exam',
        'Comprehensive practice exam covering Java programming, algorithms, and data structures. Simulates actual UIL CS competition format.',
        'mock_exam', 45, 100, 3, true
    ) RETURNING id INTO cs_mock_exam_id;
    
    -- CS Quick Practice
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        cs_subject_id,
        'Java Fundamentals Quiz',
        'Quick practice test covering basic Java syntax, variables, and control structures.',
        'practice', 15, 25, 1, true
    );

    -- =====================================================
    -- MATHEMATICS PRACTICE TESTS
    -- =====================================================
    
    -- Math Number Sense Test
    INSERT INTO practice_tests (
        id, subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        uuid_generate_v4(), math_subject_id,
        'Number Sense Practice Test',
        'Mental math practice test focusing on quick calculations, estimation, and number patterns.',
        'practice', 10, 80, 2, true
    ) RETURNING id INTO math_number_sense_id;
    
    -- Math Calculator Applications
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        math_subject_id,
        'Calculator Applications Mock Exam',
        'Practice test for UIL Calculator Applications competition with complex multi-step problems.',
        'mock_exam', 30, 70, 3, true
    );

    -- =====================================================
    -- SCIENCE PRACTICE TESTS
    -- =====================================================
    
    -- Science Biology Test
    INSERT INTO practice_tests (
        id, subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        uuid_generate_v4(), science_subject_id,
        'Biology Fundamentals Test',
        'Practice test covering cell biology, genetics, and basic biological processes.',
        'practice', 25, 50, 2, true
    ) RETURNING id INTO science_biology_id;
    
    -- Science Mixed Topics
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        science_subject_id,
        'UIL Science Mock Exam',
        'Comprehensive science test covering biology, chemistry, physics, and earth science.',
        'mock_exam', 40, 90, 4, true
    );

    -- =====================================================
    -- LITERATURE PRACTICE TESTS
    -- =====================================================
    
    -- Literature Terms Test
    INSERT INTO practice_tests (
        id, subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        uuid_generate_v4(), literature_subject_id,
        'Literary Terms & Devices Quiz',
        'Practice identifying and analyzing literary terms, devices, and techniques.',
        'practice', 20, 40, 2, true
    ) RETURNING id INTO literature_terms_id;
    
    -- Literature Analysis Test
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        literature_subject_id,
        'Literature Criticism Mock Exam',
        'Comprehensive test including passage analysis, author identification, and critical thinking.',
        'mock_exam', 35, 75, 3, true
    );

    -- =====================================================
    -- SPELLING PRACTICE TESTS
    -- =====================================================
    
    -- Spelling Basics Test
    INSERT INTO practice_tests (
        id, subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        uuid_generate_v4(), spelling_subject_id,
        'Spelling Fundamentals Quiz',
        'Practice test with commonly misspelled words and basic spelling patterns.',
        'practice', 15, 30, 1, true
    ) RETURNING id INTO spelling_basics_id;
    
    -- Spelling Advanced Test
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        spelling_subject_id,
        'Advanced Spelling & Vocabulary',
        'Challenging spelling test with advanced vocabulary and etymology questions.',
        'mock_exam', 25, 60, 4, true
    );

    -- =====================================================
    -- LINK EXISTING QUESTIONS TO PRACTICE TESTS
    -- =====================================================
    
    -- Link CS questions to CS mock exam
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT cs_mock_exam_id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM questions q
    JOIN path_modules pm ON q.module_id = pm.id
    JOIN learning_paths lp ON pm.learning_path_id = lp.id
    WHERE lp.subject_id = cs_subject_id
    AND q.is_active = true
    LIMIT 10;
    
    -- Link Math questions to Number Sense test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT math_number_sense_id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM questions q
    JOIN path_modules pm ON q.module_id = pm.id
    JOIN learning_paths lp ON pm.learning_path_id = lp.id
    WHERE lp.subject_id = math_subject_id
    AND q.is_active = true
    LIMIT 8;
    
    -- Link Science questions to Biology test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT science_biology_id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM questions q
    JOIN path_modules pm ON q.module_id = pm.id
    JOIN learning_paths lp ON pm.learning_path_id = lp.id
    WHERE lp.subject_id = science_subject_id
    AND q.is_active = true
    LIMIT 6;
    
    -- Link Literature questions to Terms test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT literature_terms_id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM questions q
    JOIN path_modules pm ON q.module_id = pm.id
    JOIN learning_paths lp ON pm.learning_path_id = lp.id
    WHERE lp.subject_id = literature_subject_id
    AND q.is_active = true
    LIMIT 5;
    
    -- Link Spelling questions to Basics test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT spelling_basics_id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM questions q
    JOIN path_modules pm ON q.module_id = pm.id
    JOIN learning_paths lp ON pm.learning_path_id = lp.id
    WHERE lp.subject_id = spelling_subject_id
    AND q.is_active = true
    LIMIT 4;

    -- =====================================================
    -- UPDATE PRACTICE TEST TOTAL POINTS
    -- =====================================================
    
    -- Update total points based on linked questions
    UPDATE practice_tests 
    SET total_points = (
        SELECT COALESCE(SUM(points), 0)
        FROM practice_test_questions 
        WHERE practice_test_id = practice_tests.id
    )
    WHERE id IN (cs_mock_exam_id, math_number_sense_id, science_biology_id, literature_terms_id, spelling_basics_id);

    -- =====================================================
    -- CREATE DIAGNOSTIC TESTS
    -- =====================================================
    
    -- Multi-Subject Diagnostic
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES (
        cs_subject_id, -- Default to CS, but this is cross-subject
        'UIL Readiness Assessment',
        'Diagnostic test to assess your readiness across all UIL subjects. Identifies strengths and areas for improvement.',
        'diagnostic', 60, 150, 3, true
    );
    
    -- Subject-specific review tests
    INSERT INTO practice_tests (
        subject_id, title, description, test_type, time_limit_minutes,
        total_points, difficulty_level, is_active
    ) VALUES 
    (cs_subject_id, 'CS Review - Algorithms', 'Review test focusing on algorithm design and analysis.', 'review', 20, 35, 2, true),
    (math_subject_id, 'Math Review - Mental Math', 'Review test for mental math techniques and shortcuts.', 'review', 12, 40, 2, true),
    (science_subject_id, 'Science Review - Chemistry', 'Review test covering basic chemistry concepts and calculations.', 'review', 18, 30, 2, true),
    (literature_subject_id, 'Literature Review - Poetry', 'Review test focusing on poetic devices and analysis.', 'review', 15, 25, 2, true),
    (spelling_subject_id, 'Spelling Review - Etymology', 'Review test on word origins and spelling patterns.', 'review', 10, 20, 2, true);

    RAISE NOTICE 'Practice tests created successfully!';
    RAISE NOTICE 'Created practice tests for all 5 UIL subjects';
    RAISE NOTICE 'Test types: mock_exam, practice, diagnostic, review';
    RAISE NOTICE 'Questions linked to tests from existing content';

END $$;
