-- =====================================================
-- PHASE 2: SCIENCE UIL CONTENT CREATION
-- =====================================================
-- This script creates learning paths, modules, and questions for Science UIL

-- =====================================================
-- SCIENCE UIL LEARNING PATHS
-- =====================================================

DO $$
DECLARE
    science_subject_id UUID;
    biology_path_id UUID;
    chemistry_path_id UUID;
    physics_path_id UUID;
    
    -- Module IDs
    cell_biology_module_id UUID;
    genetics_module_id UUID;
    atomic_structure_module_id UUID;
    chemical_reactions_module_id UUID;
    mechanics_module_id UUID;
    electricity_module_id UUID;
    
BEGIN
    -- Get science subject ID
    SELECT id INTO science_subject_id FROM subjects WHERE name = 'science';
    
    IF science_subject_id IS NULL THEN
        RAISE EXCEPTION 'Science subject not found. Please run Phase 1 script first.';
    END IF;

    -- =====================================================
    -- LEARNING PATHS
    -- =====================================================
    
    -- Biology Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), science_subject_id, 
        'Biology Mastery', 
        'Comprehensive biology curriculum covering cell biology, genetics, ecology, and human anatomy for UIL Science competitions.',
        2, 25,
        ARRAY[]::TEXT[],
        ARRAY[
            'Understand cellular structure and function',
            'Explain genetic inheritance patterns',
            'Analyze ecological relationships',
            'Describe human body systems'
        ],
        ARRAY['biology', 'cells', 'genetics', 'ecology', 'anatomy'],
        true
    ) RETURNING id INTO biology_path_id;
    
    -- Chemistry Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), science_subject_id,
        'Chemistry Fundamentals',
        'Master atomic structure, chemical bonding, reactions, and stoichiometry for UIL Chemistry competitions.',
        3, 30,
        ARRAY[]::TEXT[],
        ARRAY[
            'Understand atomic structure and periodic trends',
            'Predict chemical bonding and molecular geometry',
            'Balance chemical equations and perform stoichiometry',
            'Analyze reaction mechanisms and kinetics'
        ],
        ARRAY['chemistry', 'atoms', 'bonding', 'reactions', 'stoichiometry'],
        true
    ) RETURNING id INTO chemistry_path_id;
    
    -- Physics Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), science_subject_id,
        'Physics Principles',
        'Explore mechanics, electricity, magnetism, waves, and modern physics concepts for UIL Physics competitions.',
        3, 28,
        ARRAY[]::TEXT[],
        ARRAY[
            'Apply Newton''s laws and conservation principles',
            'Analyze electrical circuits and electromagnetic phenomena',
            'Understand wave properties and optics',
            'Explore modern physics concepts'
        ],
        ARRAY['physics', 'mechanics', 'electricity', 'waves', 'modern_physics'],
        true
    ) RETURNING id INTO physics_path_id;

    -- =====================================================
    -- MODULES FOR BIOLOGY PATH
    -- =====================================================
    
    -- Cell Biology Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), biology_path_id,
        'Cell Biology',
        'Study cell structure, organelles, membrane transport, and cellular processes including photosynthesis and respiration.',
        1, 8, true
    ) RETURNING id INTO cell_biology_module_id;
    
    -- Genetics Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), biology_path_id,
        'Genetics & Heredity',
        'Understand DNA structure, gene expression, inheritance patterns, and genetic disorders.',
        2, 7, true
    ) RETURNING id INTO genetics_module_id;

    -- =====================================================
    -- MODULES FOR CHEMISTRY PATH
    -- =====================================================
    
    -- Atomic Structure Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), chemistry_path_id,
        'Atomic Structure',
        'Explore atomic theory, electron configuration, periodic trends, and chemical bonding.',
        1, 10, true
    ) RETURNING id INTO atomic_structure_module_id;
    
    -- Chemical Reactions Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), chemistry_path_id,
        'Chemical Reactions',
        'Learn to balance equations, perform stoichiometry calculations, and understand reaction types.',
        2, 12, true
    ) RETURNING id INTO chemical_reactions_module_id;

    -- =====================================================
    -- MODULES FOR PHYSICS PATH
    -- =====================================================
    
    -- Mechanics Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), physics_path_id,
        'Mechanics',
        'Master motion, forces, energy, momentum, and rotational dynamics.',
        1, 12, true
    ) RETURNING id INTO mechanics_module_id;
    
    -- Electricity Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), physics_path_id,
        'Electricity & Magnetism',
        'Understand electric fields, circuits, magnetic fields, and electromagnetic induction.',
        2, 10, true
    ) RETURNING id INTO electricity_module_id;

    -- =====================================================
    -- SAMPLE QUESTIONS FOR CELL BIOLOGY MODULE
    -- =====================================================
    
    -- Question 1: Cell Organelles
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        cell_biology_module_id,
        'Which organelle is responsible for protein synthesis in eukaryotic cells?',
        'multiple_choice',
        'B',
        'Ribosomes are the cellular structures responsible for protein synthesis. They can be found free in the cytoplasm or attached to the endoplasmic reticulum.',
        1, 1, 1, 'text', true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) Mitochondria', false, 1
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 1;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) Ribosomes', true, 2
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 1;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) Golgi apparatus', false, 3
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 1;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) Nucleus', false, 4
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 1;
    
    -- Question 2: Photosynthesis
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        cell_biology_module_id,
        'What is the overall chemical equation for photosynthesis?',
        'short_answer',
        '6CO2 + 6H2O + light energy → C6H12O6 + 6O2',
        'Photosynthesis converts carbon dioxide and water into glucose and oxygen using light energy. The balanced equation shows 6 molecules of CO2 and H2O producing 1 glucose molecule and 6 O2 molecules.',
        2, 2, 2, 'text', true
    );
    
    -- Question 3: Cell Membrane Transport
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        cell_biology_module_id,
        'Which type of transport requires energy to move substances against their concentration gradient?',
        'multiple_choice',
        'C',
        'Active transport requires cellular energy (usually ATP) to move substances from areas of low concentration to areas of high concentration, against the concentration gradient.',
        3, 1, 2, 'text', true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) Passive transport', false, 1
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) Diffusion', false, 2
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) Active transport', true, 3
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 3;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) Osmosis', false, 4
    FROM questions q 
    WHERE q.module_id = cell_biology_module_id AND q.order_index = 3;

    -- =====================================================
    -- SAMPLE QUESTIONS FOR ATOMIC STRUCTURE MODULE
    -- =====================================================
    
    -- Question 1: Electron Configuration
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        atomic_structure_module_id,
        'What is the electron configuration of oxygen (atomic number 8)?',
        'short_answer',
        '1s² 2s² 2p⁴',
        'Oxygen has 8 electrons. Following the aufbau principle: 1s² (2 electrons), 2s² (2 electrons), 2p⁴ (4 electrons). Total: 2+2+4 = 8 electrons.',
        1, 2, 2, 'text', true
    );
    
    -- Question 2: Periodic Trends
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        atomic_structure_module_id,
        'Which element has the largest atomic radius: Li, Na, K, or Rb?',
        'short_answer',
        'Rb',
        'Atomic radius increases down a group. Among Li, Na, K, and Rb (all in Group 1), Rb is lowest on the periodic table and therefore has the largest atomic radius.',
        2, 1, 2, 'text', true
    );

    -- =====================================================
    -- SAMPLE QUESTIONS FOR MECHANICS MODULE
    -- =====================================================
    
    -- Question 1: Newton's Second Law
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        mechanics_module_id,
        'A 5 kg object experiences a net force of 20 N. What is its acceleration?',
        'calculation',
        '4 m/s²',
        'Using Newton''s second law: F = ma. Therefore, a = F/m = 20 N / 5 kg = 4 m/s². Remember that 1 N = 1 kg⋅m/s².',
        1, 2, 2, 'text', true
    );
    
    -- Question 2: Energy Conservation
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        mechanics_module_id,
        'A ball is dropped from a height of 10 m. What is its speed just before hitting the ground? (g = 9.8 m/s²)',
        'calculation',
        '14 m/s',
        'Using conservation of energy: PE = KE, so mgh = ½mv². Solving for v: v = √(2gh) = √(2 × 9.8 × 10) = √196 = 14 m/s.',
        2, 2, 3, 'text', true
    );

    -- =====================================================
    -- SUBJECT RESOURCES FOR SCIENCE
    -- =====================================================
    
    -- Formula Sheet
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        science_subject_id,
        'UIL Science Formula Sheet',
        'Essential formulas and constants for UIL science competitions',
        'formula_sheet',
        '# UIL Science Formula Sheet

## Physics Formulas

### Mechanics
- Force: F = ma
- Weight: W = mg
- Kinetic Energy: KE = ½mv²
- Potential Energy: PE = mgh
- Work: W = Fd cos θ
- Power: P = W/t = Fv
- Momentum: p = mv
- Impulse: J = FΔt = Δp

### Electricity
- Ohm''s Law: V = IR
- Power: P = VI = I²R = V²/R
- Resistance (series): R_total = R₁ + R₂ + R₃
- Resistance (parallel): 1/R_total = 1/R₁ + 1/R₂ + 1/R₃

### Waves
- Wave equation: v = fλ
- Period: T = 1/f

## Chemistry Formulas

### Stoichiometry
- Moles: n = m/M (mass/molar mass)
- Molarity: M = n/V (moles/volume in L)
- Ideal Gas Law: PV = nRT

### Thermodynamics
- Heat: q = mcΔT
- Enthalpy: ΔH = q_p (at constant pressure)

## Biology Concepts

### Genetics
- Hardy-Weinberg: p² + 2pq + q² = 1
- Punnett squares for inheritance patterns

### Ecology
- Population growth: dN/dt = rN
- Carrying capacity models

## Constants
- g = 9.8 m/s² (acceleration due to gravity)
- c = 3.0 × 10⁸ m/s (speed of light)
- R = 8.314 J/(mol⋅K) (gas constant)
- N_A = 6.022 × 10²³ mol⁻¹ (Avogadro''s number)',
        true
    );
    
    -- Reference Guide
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        science_subject_id,
        'Science Competition Strategy Guide',
        'Tips and strategies for excelling in UIL science competitions',
        'practice_guide',
        '# Science Competition Strategy Guide

## General Test-Taking Strategies

### Time Management
- Scan the entire test first
- Answer easy questions first
- Mark difficult questions to return to
- Leave 5 minutes for review

### Problem-Solving Approach
1. **Read carefully**: Identify what''s given and what''s asked
2. **Visualize**: Draw diagrams when helpful
3. **Plan**: Choose the right formula or concept
4. **Calculate**: Show your work clearly
5. **Check**: Verify units and reasonableness

## Subject-Specific Tips

### Biology
- Memorize key processes (photosynthesis, respiration)
- Understand classification systems
- Practice genetics problems
- Know human body systems

### Chemistry
- Master the periodic table trends
- Practice balancing equations
- Understand stoichiometry
- Know common ions and formulas

### Physics
- Memorize key formulas
- Practice unit conversions
- Understand vector vs. scalar quantities
- Draw free body diagrams

## Common Mistakes to Avoid
- Forgetting to include units
- Mixing up similar concepts
- Calculation errors
- Not reading questions completely
- Spending too much time on one problem

## Study Schedule (4 weeks before competition)
- **Week 1**: Review fundamentals, identify weak areas
- **Week 2**: Practice problems, focus on weak areas
- **Week 3**: Take practice tests, time yourself
- **Week 4**: Light review, rest before competition',
        true
    );

    RAISE NOTICE 'Science UIL content created successfully!';
    RAISE NOTICE 'Created % learning paths', 3;
    RAISE NOTICE 'Created % modules', 6;
    RAISE NOTICE 'Created % questions', 8;
    RAISE NOTICE 'Created % resources', 2;

END $$;
