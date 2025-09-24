-- =====================================================
-- PHASE 2: MATH UIL CONTENT CREATION
-- =====================================================
-- This script creates learning paths, modules, and questions for Math UIL

-- =====================================================
-- MATH UIL LEARNING PATHS
-- =====================================================

-- Get the mathematics subject ID
DO $$
DECLARE
    math_subject_id UUID;
    fundamentals_path_id UUID;
    number_sense_path_id UUID;
    calculator_path_id UUID;
    
    -- Module IDs
    mental_math_module_id UUID;
    arithmetic_module_id UUID;
    algebra_module_id UUID;
    geometry_module_id UUID;
    calc_basics_module_id UUID;
    calc_advanced_module_id UUID;
    
BEGIN
    -- Get mathematics subject ID
    SELECT id INTO math_subject_id FROM subjects WHERE name = 'mathematics';
    
    IF math_subject_id IS NULL THEN
        RAISE EXCEPTION 'Mathematics subject not found. Please run Phase 1 script first.';
    END IF;

    -- =====================================================
    -- LEARNING PATHS
    -- =====================================================
    
    -- Math Fundamentals Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), math_subject_id, 
        'Math Fundamentals', 
        'Master the essential mathematical concepts needed for UIL competitions including arithmetic, basic algebra, and problem-solving strategies.',
        1, 15,
        ARRAY[]::TEXT[],
        ARRAY[
            'Perform mental arithmetic quickly and accurately',
            'Solve basic algebraic equations',
            'Apply mathematical reasoning to word problems',
            'Use mathematical shortcuts and tricks'
        ],
        ARRAY['fundamentals', 'arithmetic', 'algebra', 'mental_math'],
        true
    ) RETURNING id INTO fundamentals_path_id;
    
    -- Number Sense Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), math_subject_id,
        'Number Sense Mastery',
        'Develop lightning-fast mental math skills for UIL Number Sense competition. Focus on estimation, mental calculation, and number patterns.',
        2, 20,
        ARRAY['Math Fundamentals'],
        ARRAY[
            'Perform complex mental calculations under time pressure',
            'Estimate answers quickly and accurately',
            'Recognize number patterns and sequences',
            'Apply advanced mental math techniques'
        ],
        ARRAY['number_sense', 'mental_math', 'estimation', 'patterns'],
        true
    ) RETURNING id INTO number_sense_path_id;
    
    -- Calculator Applications Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), math_subject_id,
        'Calculator Applications',
        'Master calculator techniques for UIL Calculator Applications competition. Learn efficient calculator use and problem-solving strategies.',
        2, 18,
        ARRAY['Math Fundamentals'],
        ARRAY[
            'Use calculator efficiently for complex calculations',
            'Apply calculator shortcuts and memory functions',
            'Solve multi-step problems systematically',
            'Manage time effectively during calculator competitions'
        ],
        ARRAY['calculator', 'applications', 'efficiency', 'problem_solving'],
        true
    ) RETURNING id INTO calculator_path_id;

    -- =====================================================
    -- MODULES FOR MATH FUNDAMENTALS PATH
    -- =====================================================
    
    -- Mental Math Basics Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), fundamentals_path_id,
        'Mental Math Basics',
        'Learn fundamental mental math techniques including addition, subtraction, multiplication, and division shortcuts.',
        1, 4, true
    ) RETURNING id INTO mental_math_module_id;
    
    -- Arithmetic Mastery Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), fundamentals_path_id,
        'Arithmetic Mastery',
        'Master fractions, decimals, percentages, and their conversions. Essential for all UIL math competitions.',
        2, 5, true
    ) RETURNING id INTO arithmetic_module_id;
    
    -- Basic Algebra Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), fundamentals_path_id,
        'Basic Algebra',
        'Solve linear equations, work with variables, and understand algebraic expressions and formulas.',
        3, 3, true
    ) RETURNING id INTO algebra_module_id;
    
    -- Geometry Basics Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), fundamentals_path_id,
        'Geometry Basics',
        'Calculate areas, perimeters, volumes, and work with basic geometric shapes and formulas.',
        4, 3, true
    ) RETURNING id INTO geometry_module_id;

    -- =====================================================
    -- SAMPLE QUESTIONS FOR MENTAL MATH BASICS MODULE
    -- =====================================================
    
    -- Question 1: Mental Addition
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        mental_math_module_id,
        'Calculate mentally: 47 + 38 = ?',
        'short_answer',
        '85',
        'Break it down: 47 + 38 = 47 + 40 - 2 = 87 - 2 = 85. Or: 50 - 3 + 40 - 2 = 90 - 5 = 85.',
        1, 1, 1, 30, true
    );
    
    -- Question 2: Mental Multiplication
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        mental_math_module_id,
        'Calculate mentally: 25 × 16 = ?',
        'short_answer',
        '400',
        'Use the fact that 25 × 4 = 100. So 25 × 16 = 25 × 4 × 4 = 100 × 4 = 400.',
        2, 1, 2, 45, true
    );
    
    -- Question 3: Multiple Choice - Mental Division
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        mental_math_module_id,
        'What is 144 ÷ 12?',
        'multiple_choice',
        'B',
        '144 ÷ 12 = 12 because 12 × 12 = 144. You can also think of it as 144 ÷ 12 = (120 + 24) ÷ 12 = 10 + 2 = 12.',
        3, 1, 1, 30, true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) 10', false, 1
    FROM questions q 
    WHERE q.module_id = mental_math_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) 12', true, 2
    FROM questions q 
    WHERE q.module_id = mental_math_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) 14', false, 3
    FROM questions q 
    WHERE q.module_id = mental_math_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) 16', false, 4
    FROM questions q 
    WHERE q.module_id = mental_math_module_id AND q.order_index = 3;
    
    -- Question 4: Percentage Calculation
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        mental_math_module_id,
        'What is 15% of 80?',
        'short_answer',
        '12',
        '15% of 80 = 0.15 × 80. Think: 10% of 80 = 8, and 5% of 80 = 4, so 15% = 8 + 4 = 12.',
        4, 1, 2, 45, true
    );
    
    -- Question 5: Square Recognition
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        mental_math_module_id,
        'What is 13²?',
        'short_answer',
        '169',
        '13² = (10 + 3)² = 10² + 2(10)(3) + 3² = 100 + 60 + 9 = 169. Or memorize: 13² = 169.',
        5, 1, 2, 30, true
    );

    -- =====================================================
    -- SAMPLE QUESTIONS FOR ARITHMETIC MASTERY MODULE
    -- =====================================================
    
    -- Question 1: Fraction Addition
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        arithmetic_module_id,
        'Calculate: 2/3 + 1/4 = ? (Express as a simplified fraction)',
        'short_answer',
        '11/12',
        'Find common denominator: 2/3 + 1/4 = 8/12 + 3/12 = 11/12. Since 11 and 12 share no common factors, this is simplified.',
        1, 2, 2, 60, true
    );
    
    -- Question 2: Decimal to Percentage
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        arithmetic_module_id,
        'Convert 0.375 to a percentage.',
        'short_answer',
        '37.5%',
        'To convert decimal to percentage, multiply by 100: 0.375 × 100 = 37.5%.',
        2, 1, 1, 30, true
    );
    
    -- Question 3: Multiple Choice - Fraction to Decimal
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, time_limit_seconds, is_active
    ) VALUES (
        arithmetic_module_id,
        'What is 5/8 as a decimal?',
        'multiple_choice',
        'C',
        '5/8 = 5 ÷ 8 = 0.625. You can also think: 5/8 = 5 × 125/8 × 125 = 625/1000 = 0.625.',
        3, 1, 2, 45, true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) 0.58', false, 1
    FROM questions q 
    WHERE q.module_id = arithmetic_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) 0.6', false, 2
    FROM questions q 
    WHERE q.module_id = arithmetic_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) 0.625', true, 3
    FROM questions q 
    WHERE q.module_id = arithmetic_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) 0.68', false, 4
    FROM questions q 
    WHERE q.module_id = arithmetic_module_id AND q.order_index = 3;

    -- =====================================================
    -- SUBJECT RESOURCES FOR MATHEMATICS
    -- =====================================================
    
    -- Formula Sheet
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        math_subject_id,
        'UIL Math Formula Sheet',
        'Essential formulas for UIL mathematics competitions',
        'formula_sheet',
        '# UIL Math Formula Sheet

## Arithmetic
- Percentage: P% of N = (P/100) × N
- Simple Interest: I = PRT (Principal × Rate × Time)
- Compound Interest: A = P(1 + r)^t

## Algebra
- Quadratic Formula: x = (-b ± √(b² - 4ac)) / 2a
- Distance Formula: d = √((x₂-x₁)² + (y₂-y₁)²)
- Slope: m = (y₂-y₁)/(x₂-x₁)

## Geometry
- Area of Circle: A = πr²
- Area of Triangle: A = ½bh
- Area of Rectangle: A = lw
- Volume of Cylinder: V = πr²h
- Volume of Sphere: V = (4/3)πr³

## Number Sense Tricks
- Squaring numbers ending in 5: (10a + 5)² = 100a(a+1) + 25
- Multiplying by 11: 23 × 11 = 2(2+3)3 = 253
- Multiplying by 25: N × 25 = N × 100/4',
        true
    );
    
    -- Practice Guide
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        math_subject_id,
        'Mental Math Practice Guide',
        'Strategies and techniques for improving mental math speed',
        'practice_guide',
        '# Mental Math Practice Guide

## Daily Practice Routine
1. **Warm-up (5 minutes)**: Basic addition/subtraction
2. **Multiplication Tables (5 minutes)**: Focus on 6-12 tables
3. **Mental Tricks (10 minutes)**: Practice specific techniques
4. **Timed Problems (10 minutes)**: Simulate competition conditions

## Key Techniques

### Addition/Subtraction
- **Compensation**: 47 + 38 = 47 + 40 - 2 = 85
- **Breaking Apart**: 67 + 25 = 67 + 20 + 5 = 92

### Multiplication
- **Doubling and Halving**: 16 × 25 = 8 × 50 = 4 × 100 = 400
- **Using 10s**: 23 × 11 = 23 × 10 + 23 = 253

### Division
- **Factor Recognition**: 144 ÷ 12 = 144 ÷ (4 × 3) = 36 ÷ 3 = 12
- **Estimation**: Check if answer makes sense

## Competition Tips
- Read problems carefully
- Estimate first, then calculate
- Use scratch paper efficiently
- Practice under time pressure',
        true
    );

    RAISE NOTICE 'Math UIL content created successfully!';
    RAISE NOTICE 'Created % learning paths', 3;
    RAISE NOTICE 'Created % modules', 4;
    RAISE NOTICE 'Created % questions', 8;
    RAISE NOTICE 'Created % resources', 2;

END $$;
