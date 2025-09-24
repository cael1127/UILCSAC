-- =====================================================
-- PHASE 2: LITERATURE & SPELLING UIL CONTENT CREATION
-- =====================================================
-- This script creates learning paths, modules, and questions for Literature and Spelling UIL

DO $$
DECLARE
    literature_subject_id UUID;
    spelling_subject_id UUID;
    literature_path_id UUID;
    spelling_path_id UUID;
    
    -- Module IDs
    literary_terms_module_id UUID;
    major_works_module_id UUID;
    word_lists_module_id UUID;
    etymology_module_id UUID;
    
BEGIN
    -- Get subject IDs
    SELECT id INTO literature_subject_id FROM subjects WHERE name = 'literature';
    SELECT id INTO spelling_subject_id FROM subjects WHERE name = 'spelling';
    
    IF literature_subject_id IS NULL OR spelling_subject_id IS NULL THEN
        RAISE EXCEPTION 'Literature or Spelling subject not found. Please run Phase 1 script first.';
    END IF;

    -- =====================================================
    -- LITERATURE LEARNING PATHS
    -- =====================================================
    
    -- Literature Criticism Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), literature_subject_id, 
        'Literature Criticism Mastery', 
        'Comprehensive literature analysis covering literary terms, major works, critical thinking, and analytical writing for UIL Literature Criticism competitions.',
        2, 20,
        ARRAY[]::TEXT[],
        ARRAY[
            'Identify and analyze literary devices and techniques',
            'Understand major literary works and their contexts',
            'Apply critical thinking to literary analysis',
            'Write effective literary criticism and analysis'
        ],
        ARRAY['literature', 'criticism', 'analysis', 'literary_devices', 'major_works'],
        true
    ) RETURNING id INTO literature_path_id;

    -- =====================================================
    -- SPELLING LEARNING PATHS
    -- =====================================================
    
    -- Spelling & Vocabulary Path
    INSERT INTO learning_paths (
        id, subject_id, name, description, difficulty_level, estimated_hours,
        prerequisites, learning_objectives, tags, is_active
    ) VALUES (
        uuid_generate_v4(), spelling_subject_id,
        'Spelling & Vocabulary Excellence',
        'Master spelling patterns, word origins, and vocabulary building for UIL Spelling & Vocabulary competitions.',
        2, 15,
        ARRAY[]::TEXT[],
        ARRAY[
            'Master common spelling patterns and rules',
            'Understand word etymology and origins',
            'Build advanced vocabulary',
            'Apply spelling strategies under pressure'
        ],
        ARRAY['spelling', 'vocabulary', 'etymology', 'word_patterns'],
        true
    ) RETURNING id INTO spelling_path_id;

    -- =====================================================
    -- MODULES FOR LITERATURE PATH
    -- =====================================================
    
    -- Literary Terms Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), literature_path_id,
        'Literary Terms & Devices',
        'Master essential literary terms, devices, and techniques used in poetry, prose, and drama.',
        1, 8, true
    ) RETURNING id INTO literary_terms_module_id;
    
    -- Major Works Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), literature_path_id,
        'Major Works & Authors',
        'Study significant literary works, authors, and their historical and cultural contexts.',
        2, 12, true
    ) RETURNING id INTO major_works_module_id;

    -- =====================================================
    -- MODULES FOR SPELLING PATH
    -- =====================================================
    
    -- Word Lists Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), spelling_path_id,
        'UIL Word Lists',
        'Practice with official UIL spelling word lists, focusing on commonly misspelled words and patterns.',
        1, 8, true
    ) RETURNING id INTO word_lists_module_id;
    
    -- Etymology Module
    INSERT INTO path_modules (
        id, learning_path_id, name, description, order_index, estimated_hours, is_active
    ) VALUES (
        uuid_generate_v4(), spelling_path_id,
        'Etymology & Word Origins',
        'Understand word origins, roots, prefixes, and suffixes to improve spelling accuracy.',
        2, 7, true
    ) RETURNING id INTO etymology_module_id;

    -- =====================================================
    -- SAMPLE QUESTIONS FOR LITERARY TERMS MODULE
    -- =====================================================
    
    -- Question 1: Literary Device Identification
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        literary_terms_module_id,
        'What literary device is used in the phrase "The wind whispered through the trees"?',
        'multiple_choice',
        'B',
        'Personification is the literary device that gives human characteristics to non-human things. In this case, the wind is given the human ability to whisper.',
        1, 1, 1, 'text', true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) Metaphor', false, 1
    FROM questions q 
    WHERE q.module_id = literary_terms_module_id AND q.order_index = 1;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) Personification', true, 2
    FROM questions q 
    WHERE q.module_id = literary_terms_module_id AND q.order_index = 1;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) Simile', false, 3
    FROM questions q 
    WHERE q.module_id = literary_terms_module_id AND q.order_index = 1;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) Alliteration', false, 4
    FROM questions q 
    WHERE q.module_id = literary_terms_module_id AND q.order_index = 1;
    
    -- Question 2: Text Analysis
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, media_metadata, is_active
    ) VALUES (
        literary_terms_module_id,
        'Analyze the use of symbolism in the following passage and explain its significance.',
        'text_analysis',
        'Sample analysis focusing on symbolic elements',
        'Look for objects, colors, or elements that represent deeper meanings beyond their literal sense. Consider the context and how symbols contribute to the overall theme.',
        2, 3, 3, 'text', 
        jsonb_build_object(
            'passage', 'The old oak tree stood alone in the field, its gnarled branches reaching toward the gray sky like desperate fingers. At its base, a single red rose bloomed defiantly against the approaching winter.',
            'title', 'Symbolic Passage',
            'analysisPrompt', 'Identify and analyze the symbolic elements in this passage.'
        ), 
        true
    );
    
    -- Question 3: Poetic Device
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        literary_terms_module_id,
        'Which poetic device involves the repetition of consonant sounds at the beginning of words?',
        'short_answer',
        'alliteration',
        'Alliteration is the repetition of initial consonant sounds in a series of words, such as "Peter Piper picked a peck of pickled peppers."',
        3, 1, 2, 'text', true
    );

    -- =====================================================
    -- SAMPLE QUESTIONS FOR MAJOR WORKS MODULE
    -- =====================================================
    
    -- Question 1: Author Identification
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        major_works_module_id,
        'Who wrote "To Kill a Mockingbird"?',
        'short_answer',
        'Harper Lee',
        'Harper Lee wrote "To Kill a Mockingbird," published in 1960. The novel won the Pulitzer Prize for Fiction in 1961.',
        1, 1, 1, 'text', true
    );
    
    -- Question 2: Theme Analysis
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        major_works_module_id,
        'What is the central theme of Shakespeare''s "Romeo and Juliet"?',
        'multiple_choice',
        'A',
        'The central theme of "Romeo and Juliet" is the destructive power of love and hate, showing how intense emotions can lead to tragedy.',
        2, 2, 2, 'text', true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) The destructive power of love and hate', true, 1
    FROM questions q 
    WHERE q.module_id = major_works_module_id AND q.order_index = 2;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) The importance of family honor', false, 2
    FROM questions q 
    WHERE q.module_id = major_works_module_id AND q.order_index = 2;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) The conflict between youth and age', false, 3
    FROM questions q 
    WHERE q.module_id = major_works_module_id AND q.order_index = 2;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) The power of fate over free will', false, 4
    FROM questions q 
    WHERE q.module_id = major_works_module_id AND q.order_index = 2;

    -- =====================================================
    -- SAMPLE QUESTIONS FOR WORD LISTS MODULE
    -- =====================================================
    
    -- Question 1: Spelling Challenge
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        word_lists_module_id,
        'Spell the word that means "existing in thought or as an idea but not having a physical or concrete existence."',
        'dictation',
        'abstract',
        'Abstract (a-b-s-t-r-a-c-t) comes from Latin "abstractus," meaning "drawn away." Remember the "abs-" prefix meaning "away from."',
        1, 1, 2, 'text', true
    );
    
    -- Question 2: Multiple Choice Spelling
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        word_lists_module_id,
        'Which is the correct spelling of the word meaning "to make or become different"?',
        'multiple_choice',
        'C',
        'The correct spelling is "separate" (s-e-p-a-r-a-t-e). Remember: there is "a rat" in separate.',
        2, 1, 1, 'text', true
    );
    
    -- Add options for the multiple choice question
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'A) seperate', false, 1
    FROM questions q 
    WHERE q.module_id = word_lists_module_id AND q.order_index = 2;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'B) separat', false, 2
    FROM questions q 
    WHERE q.module_id = word_lists_module_id AND q.order_index = 2;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'C) separate', true, 3
    FROM questions q 
    WHERE q.module_id = word_lists_module_id AND q.order_index = 2;
    
    INSERT INTO question_options (question_id, option_text, is_correct, order_index)
    SELECT q.id, 'D) separete', false, 4
    FROM questions q 
    WHERE q.module_id = word_lists_module_id AND q.order_index = 2;

    -- =====================================================
    -- SAMPLE QUESTIONS FOR ETYMOLOGY MODULE
    -- =====================================================
    
    -- Question 1: Root Word Analysis
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        etymology_module_id,
        'What does the Latin root "bene" mean?',
        'short_answer',
        'good',
        'The Latin root "bene" means "good" or "well." It appears in words like benefit, benevolent, and benediction.',
        1, 1, 1, 'text', true
    );
    
    -- Question 2: Word Formation
    INSERT INTO questions (
        module_id, question_text, question_type, correct_answer, explanation,
        order_index, points, difficulty_level, media_type, is_active
    ) VALUES (
        etymology_module_id,
        'If "geo" means earth and "logy" means study, what does "geology" mean?',
        'short_answer',
        'study of earth',
        'Geology is the study of the Earth, including its physical structure, substance, history, and processes.',
        2, 1, 2, 'text', true
    );

    -- =====================================================
    -- SUBJECT RESOURCES FOR LITERATURE
    -- =====================================================
    
    -- Literary Terms Glossary
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        literature_subject_id,
        'Literary Terms Glossary',
        'Comprehensive glossary of literary terms and devices for UIL Literature Criticism',
        'glossary',
        '# Literary Terms Glossary

## Figurative Language
- **Metaphor**: Direct comparison without using "like" or "as"
- **Simile**: Comparison using "like" or "as"
- **Personification**: Giving human characteristics to non-human things
- **Hyperbole**: Deliberate exaggeration for effect
- **Irony**: Contrast between expectation and reality

## Poetic Devices
- **Alliteration**: Repetition of initial consonant sounds
- **Assonance**: Repetition of vowel sounds
- **Consonance**: Repetition of consonant sounds
- **Rhyme Scheme**: Pattern of rhymes at the end of lines
- **Meter**: Rhythmic pattern of stressed and unstressed syllables

## Narrative Elements
- **Plot**: Sequence of events in a story
- **Setting**: Time and place of the story
- **Character**: People or entities in the story
- **Theme**: Central message or meaning
- **Point of View**: Perspective from which the story is told

## Literary Movements
- **Romanticism**: Emphasis on emotion, nature, and individualism
- **Realism**: Accurate representation of everyday life
- **Modernism**: Experimental techniques and themes
- **Postmodernism**: Questioning of traditional narratives',
        true
    );
    
    -- Major Works Reference
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        literature_subject_id,
        'Major Works Quick Reference',
        'Essential information about major literary works commonly featured in UIL competitions',
        'reference_guide',
        '# Major Works Quick Reference

## American Literature

### "To Kill a Mockingbird" - Harper Lee (1960)
- **Theme**: Racial injustice, moral growth, loss of innocence
- **Setting**: 1930s Alabama
- **Key Characters**: Scout Finch, Atticus Finch, Boo Radley

### "The Great Gatsby" - F. Scott Fitzgerald (1925)
- **Theme**: American Dream, wealth and class, moral decay
- **Setting**: 1920s New York
- **Key Characters**: Jay Gatsby, Nick Carraway, Daisy Buchanan

## British Literature

### "Romeo and Juliet" - William Shakespeare (1597)
- **Theme**: Love vs. hate, fate vs. free will, youth vs. age
- **Setting**: Verona, Italy
- **Key Characters**: Romeo, Juliet, Mercutio, Tybalt

### "Pride and Prejudice" - Jane Austen (1813)
- **Theme**: Social class, marriage, first impressions
- **Setting**: Regency England
- **Key Characters**: Elizabeth Bennet, Mr. Darcy

## World Literature

### "The Odyssey" - Homer (8th century BCE)
- **Theme**: Heroism, loyalty, homecoming
- **Setting**: Ancient Greece and Mediterranean
- **Key Characters**: Odysseus, Penelope, Athena',
        true
    );

    -- =====================================================
    -- SUBJECT RESOURCES FOR SPELLING
    -- =====================================================
    
    -- Spelling Rules Guide
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        spelling_subject_id,
        'Spelling Rules & Patterns',
        'Essential spelling rules and patterns for UIL Spelling & Vocabulary competitions',
        'practice_guide',
        '# Spelling Rules & Patterns

## Basic Rules

### I Before E Rule
- **Rule**: "I before E except after C, or when sounding like A as in neighbor and weigh"
- **Examples**: believe, receive, eight, freight
- **Exceptions**: weird, seize, either, neither

### Doubling Final Consonants
- **Rule**: Double the final consonant when adding suffixes to one-syllable words ending in consonant-vowel-consonant
- **Examples**: run → running, big → bigger, stop → stopped

### Silent E Rule
- **Rule**: Drop silent E when adding suffixes beginning with vowels
- **Examples**: make → making, hope → hoping, care → caring

## Common Patterns

### -TION vs -SION
- **-TION**: Usually after consonants (action, mention, question)
- **-SION**: Usually after vowels or L, N, R (division, tension, version)

### -ABLE vs -IBLE
- **-ABLE**: More common, often with complete root words (comfortable, readable)
- **-IBLE**: Less common, often with incomplete roots (terrible, possible)

## Memory Tricks

### Commonly Misspelled Words
- **SEPARATE**: There is "a rat" in separate
- **DEFINITELY**: "Finite" is in definitely
- **NECESSARY**: One collar, two sleeves (one C, two S)
- **EMBARRASS**: Two R, two S - really red, super shy

## Etymology Helpers

### Common Roots
- **BENE** (good): benefit, benevolent
- **MAL** (bad): malicious, malfunction  
- **GEO** (earth): geography, geology
- **BIO** (life): biology, biography',
        true
    );
    
    -- Word Lists Resource
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        spelling_subject_id,
        'UIL Practice Word Lists',
        'Curated word lists based on common UIL Spelling & Vocabulary competition words',
        'practice_guide',
        '# UIL Practice Word Lists

## Level 1: Foundation Words
- accommodate, achievement, acquire, address, amateur
- apparent, argument, beginning, believe, business
- calendar, cemetery, committee, conscience, conscious
- definitely, discipline, embarrass, environment, equipment
- existence, experience, familiar, February, foreign

## Level 2: Intermediate Words
- accessible, accidentally, acknowledge, adolescence, advantageous
- bureaucracy, caffeine, campaign, candidate, catastrophe
- changeable, characteristic, colleague, commitment, comparison
- conscientious, consensus, contemporary, controversy, correspondence
- curriculum, deceive, descendant, desperate, development

## Level 3: Advanced Words
- acquaintance, acknowledgment, bureaucratic, conscientious, correspondence
- entrepreneur, exaggerate, existence, extraordinary, fascinate
- government, guarantee, harass, hierarchy, hypocrisy
- independent, intelligence, interrupt, knowledge, laboratory
- maintenance, millennium, necessary, occasion, occurrence

## Subject-Specific Terms

### Literature Terms
- alliteration, antagonist, bibliography, characterization, climax
- denouement, exposition, foreshadowing, metaphor, onomatopoeia
- personification, protagonist, soliloquy, symbolism, tragedy

### Science Terms
- acceleration, chromosome, ecosystem, hypothesis, molecule
- photosynthesis, precipitation, respiration, temperature, velocity

### Mathematics Terms
- algorithm, coefficient, denominator, equation, geometry
- hypotenuse, integer, parallelogram, polynomial, statistics',
        true
    );

    RAISE NOTICE 'Literature and Spelling UIL content created successfully!';
    RAISE NOTICE 'Created % learning paths', 2;
    RAISE NOTICE 'Created % modules', 4;
    RAISE NOTICE 'Created % questions', 8;
    RAISE NOTICE 'Created % resources', 4;

END $$;
