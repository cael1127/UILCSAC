-- =====================================================
-- FIX PRACTICE TESTS AND ADD MORE CONTENT
-- =====================================================
-- This script fixes empty practice tests and adds more questions

DO $$
DECLARE
    cs_subject_id UUID;
    math_subject_id UUID;
    science_subject_id UUID;
    literature_subject_id UUID;
    spelling_subject_id UUID;
    
    -- Get some module IDs for adding questions
    cs_module_id UUID;
    math_module_id UUID;
    science_module_id UUID;
    literature_module_id UUID;
    spelling_module_id UUID;
    
BEGIN
    -- Get subject IDs
    SELECT id INTO cs_subject_id FROM subjects WHERE name = 'computer_science';
    SELECT id INTO math_subject_id FROM subjects WHERE name = 'mathematics';
    SELECT id INTO science_subject_id FROM subjects WHERE name = 'science';
    SELECT id INTO literature_subject_id FROM subjects WHERE name = 'literature';
    SELECT id INTO spelling_subject_id FROM subjects WHERE name = 'spelling';

    -- =====================================================
    -- ADD COMPUTER SCIENCE RESOURCES
    -- =====================================================
    
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        cs_subject_id,
        'Java Quick Reference',
        'Essential Java syntax and concepts for UIL Computer Science',
        'reference_guide',
        '# Java Quick Reference

## Basic Syntax
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## Data Types
- **int**: 32-bit integer (-2,147,483,648 to 2,147,483,647)
- **double**: 64-bit floating point
- **boolean**: true or false
- **String**: Text data
- **char**: Single character

## Control Structures
```java
// If statement
if (condition) {
    // code
} else if (condition2) {
    // code
} else {
    // code
}

// For loop
for (int i = 0; i < 10; i++) {
    // code
}

// While loop
while (condition) {
    // code
}
```

## Arrays
```java
// Declaration and initialization
int[] numbers = {1, 2, 3, 4, 5};
int[] array = new int[10];

// Access elements
int first = numbers[0];
int length = numbers.length;
```

## Common Methods
```java
// String methods
String text = "Hello";
int len = text.length();
String upper = text.toUpperCase();
String sub = text.substring(1, 3);

// Math methods
int max = Math.max(a, b);
int min = Math.min(a, b);
double sqrt = Math.sqrt(25);
int abs = Math.abs(-5);
```',
        true
    );
    
    INSERT INTO subject_resources (
        subject_id, title, description, resource_type, content, is_active
    ) VALUES (
        cs_subject_id,
        'Algorithm Patterns',
        'Common algorithm patterns for UIL Computer Science competitions',
        'practice_guide',
        '# Algorithm Patterns

## Searching Algorithms

### Linear Search
```java
public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}
```

### Binary Search
```java
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
```

## Sorting Algorithms

### Bubble Sort
```java
public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}
```

## String Processing
```java
// Palindrome check
public static boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}
```',
        true
    );

    -- =====================================================
    -- ADD MORE QUESTIONS TO EXISTING MODULES
    -- =====================================================
    
    -- Get first module from each subject for adding questions
    SELECT pm.id INTO cs_module_id 
    FROM path_modules pm 
    JOIN learning_paths lp ON pm.learning_path_id = lp.id 
    WHERE lp.subject_id = cs_subject_id 
    ORDER BY pm.order_index 
    LIMIT 1;
    
    SELECT pm.id INTO math_module_id 
    FROM path_modules pm 
    JOIN learning_paths lp ON pm.learning_path_id = lp.id 
    WHERE lp.subject_id = math_subject_id 
    ORDER BY pm.order_index 
    LIMIT 1;
    
    SELECT pm.id INTO science_module_id 
    FROM path_modules pm 
    JOIN learning_paths lp ON pm.learning_path_id = lp.id 
    WHERE lp.subject_id = science_subject_id 
    ORDER BY pm.order_index 
    LIMIT 1;
    
    SELECT pm.id INTO literature_module_id 
    FROM path_modules pm 
    JOIN learning_paths lp ON pm.learning_path_id = lp.id 
    WHERE lp.subject_id = literature_subject_id 
    ORDER BY pm.order_index 
    LIMIT 1;
    
    SELECT pm.id INTO spelling_module_id 
    FROM path_modules pm 
    JOIN learning_paths lp ON pm.learning_path_id = lp.id 
    WHERE lp.subject_id = spelling_subject_id 
    ORDER BY pm.order_index 
    LIMIT 1;

    -- =====================================================
    -- ADD MORE COMPUTER SCIENCE QUESTIONS
    -- =====================================================
    
    IF cs_module_id IS NOT NULL THEN
        -- Java Basics Questions
        INSERT INTO questions (
            module_id, question_text, question_type, correct_answer, explanation,
            order_index, points, difficulty_level, is_active
        ) VALUES 
        (cs_module_id, 'What is the correct way to declare an integer variable in Java?', 'multiple_choice', 'B', 'In Java, variables are declared with the data type followed by the variable name: int variableName;', 10, 1, 1, true),
        (cs_module_id, 'Which method is used to find the length of a String in Java?', 'multiple_choice', 'A', 'The length() method returns the number of characters in a String.', 11, 1, 1, true),
        (cs_module_id, 'What will be the output of: System.out.println(5 + 3 + "2");', 'short_answer', '82', 'Java evaluates left to right: 5 + 3 = 8, then 8 + "2" = "82" (string concatenation).', 12, 2, 2, true),
        (cs_module_id, 'Write a Java method that returns the maximum of two integers.', 'written_response', 'public static int max(int a, int b) { return (a > b) ? a : b; }', 'Use a conditional operator or if-else statement to compare the two values.', 13, 3, 2, true),
        (cs_module_id, 'What is the index of the last element in an array of size n?', 'short_answer', 'n-1', 'Array indices start at 0, so the last element is at index n-1 where n is the array length.', 14, 1, 1, true);
        
        -- Add options for multiple choice questions
        INSERT INTO question_options (question_id, option_text, is_correct, order_index)
        SELECT q.id, 'A) integer variableName;', false, 1 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 10
        UNION ALL
        SELECT q.id, 'B) int variableName;', true, 2 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 10
        UNION ALL
        SELECT q.id, 'C) Integer variableName;', false, 3 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 10
        UNION ALL
        SELECT q.id, 'D) var variableName;', false, 4 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 10;
        
        INSERT INTO question_options (question_id, option_text, is_correct, order_index)
        SELECT q.id, 'A) length()', true, 1 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 11
        UNION ALL
        SELECT q.id, 'B) size()', false, 2 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 11
        UNION ALL
        SELECT q.id, 'C) count()', false, 3 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 11
        UNION ALL
        SELECT q.id, 'D) len()', false, 4 FROM questions q WHERE q.module_id = cs_module_id AND q.order_index = 11;
    END IF;

    -- =====================================================
    -- ADD MORE MATH QUESTIONS
    -- =====================================================
    
    IF math_module_id IS NOT NULL THEN
        INSERT INTO questions (
            module_id, question_text, question_type, correct_answer, explanation,
            order_index, points, difficulty_level, time_limit_seconds, is_active
        ) VALUES 
        (math_module_id, 'Calculate: 17 × 23 = ?', 'calculation', '391', 'Use the distributive property: 17 × 23 = 17 × (20 + 3) = 17 × 20 + 17 × 3 = 340 + 51 = 391', 10, 2, 2, 60, true),
        (math_module_id, 'What is 64²?', 'short_answer', '4096', '64² = (60 + 4)² = 60² + 2(60)(4) + 4² = 3600 + 480 + 16 = 4096', 11, 1, 2, 45, true),
        (math_module_id, 'Convert 3/8 to a decimal.', 'short_answer', '0.375', '3/8 = 3 ÷ 8 = 0.375', 12, 1, 1, 30, true),
        (math_module_id, 'What is 20% of 150?', 'calculation', '30', '20% of 150 = 0.20 × 150 = 30', 13, 1, 1, 30, true),
        (math_module_id, 'Solve for x: 2x + 5 = 17', 'short_answer', '6', '2x + 5 = 17, so 2x = 12, therefore x = 6', 14, 2, 2, 45, true);
    END IF;

    -- =====================================================
    -- ADD MORE SCIENCE QUESTIONS
    -- =====================================================
    
    IF science_module_id IS NOT NULL THEN
        INSERT INTO questions (
            module_id, question_text, question_type, correct_answer, explanation,
            order_index, points, difficulty_level, is_active
        ) VALUES 
        (science_module_id, 'What is the chemical symbol for gold?', 'short_answer', 'Au', 'Gold has the chemical symbol Au, from the Latin word "aurum".', 10, 1, 1, true),
        (science_module_id, 'How many chambers does a human heart have?', 'multiple_choice', 'D', 'The human heart has four chambers: two atria (upper chambers) and two ventricles (lower chambers).', 11, 1, 1, true),
        (science_module_id, 'What is the speed of light in a vacuum?', 'short_answer', '3.0 × 10⁸ m/s', 'The speed of light in a vacuum is approximately 3.0 × 10⁸ meters per second.', 12, 2, 2, true),
        (science_module_id, 'Balance this equation: H₂ + O₂ → H₂O', 'short_answer', '2H₂ + O₂ → 2H₂O', 'To balance: 2 hydrogen molecules + 1 oxygen molecule → 2 water molecules', 13, 2, 3, true),
        (science_module_id, 'What force keeps planets in orbit around the sun?', 'short_answer', 'gravity', 'Gravitational force between the sun and planets keeps them in orbital motion.', 14, 1, 1, true);
        
        -- Add options for the heart chambers question
        INSERT INTO question_options (question_id, option_text, is_correct, order_index)
        SELECT q.id, 'A) Two', false, 1 FROM questions q WHERE q.module_id = science_module_id AND q.order_index = 11
        UNION ALL
        SELECT q.id, 'B) Three', false, 2 FROM questions q WHERE q.module_id = science_module_id AND q.order_index = 11
        UNION ALL
        SELECT q.id, 'C) Five', false, 3 FROM questions q WHERE q.module_id = science_module_id AND q.order_index = 11
        UNION ALL
        SELECT q.id, 'D) Four', true, 4 FROM questions q WHERE q.module_id = science_module_id AND q.order_index = 11;
    END IF;

    -- =====================================================
    -- ADD MORE LITERATURE QUESTIONS
    -- =====================================================
    
    IF literature_module_id IS NOT NULL THEN
        INSERT INTO questions (
            module_id, question_text, question_type, correct_answer, explanation,
            order_index, points, difficulty_level, is_active
        ) VALUES 
        (literature_module_id, 'What literary device compares two things using "like" or "as"?', 'short_answer', 'simile', 'A simile is a figure of speech that compares two different things using "like" or "as".', 10, 1, 1, true),
        (literature_module_id, 'Who wrote "The Great Gatsby"?', 'short_answer', 'F. Scott Fitzgerald', 'F. Scott Fitzgerald wrote "The Great Gatsby" in 1925.', 11, 1, 1, true),
        (literature_module_id, 'What is the rhyme scheme of a Shakespearean sonnet?', 'short_answer', 'ABAB CDCD EFEF GG', 'A Shakespearean sonnet has 14 lines with the rhyme scheme ABAB CDCD EFEF GG.', 12, 2, 3, true),
        (literature_module_id, 'Define "protagonist" in literature.', 'written_response', 'The main character or hero of a story', 'The protagonist is the central character around whom the story revolves.', 13, 2, 2, true),
        (literature_module_id, 'What does "irony" mean in literature?', 'multiple_choice', 'C', 'Irony is a contrast between expectation and reality, or between what is said and what is meant.', 14, 1, 2, true);
        
        -- Add options for the irony question
        INSERT INTO question_options (question_id, option_text, is_correct, order_index)
        SELECT q.id, 'A) A type of rhyme scheme', false, 1 FROM questions q WHERE q.module_id = literature_module_id AND q.order_index = 14
        UNION ALL
        SELECT q.id, 'B) A poetic meter', false, 2 FROM questions q WHERE q.module_id = literature_module_id AND q.order_index = 14
        UNION ALL
        SELECT q.id, 'C) A contrast between expectation and reality', true, 3 FROM questions q WHERE q.module_id = literature_module_id AND q.order_index = 14
        UNION ALL
        SELECT q.id, 'D) A type of character', false, 4 FROM questions q WHERE q.module_id = literature_module_id AND q.order_index = 14;
    END IF;

    -- =====================================================
    -- ADD MORE SPELLING QUESTIONS
    -- =====================================================
    
    IF spelling_module_id IS NOT NULL THEN
        INSERT INTO questions (
            module_id, question_text, question_type, correct_answer, explanation,
            order_index, points, difficulty_level, is_active
        ) VALUES 
        (spelling_module_id, 'Spell the word meaning "to make or become different":', 'dictation', 'change', 'Change (c-h-a-n-g-e) - from Old French "changier"', 10, 1, 1, true),
        (spelling_module_id, 'Spell the word meaning "having knowledge or skill":', 'dictation', 'competent', 'Competent (c-o-m-p-e-t-e-n-t) - from Latin "competere" meaning "to strive together"', 11, 1, 2, true),
        (spelling_module_id, 'What does the prefix "pre-" mean?', 'short_answer', 'before', 'The prefix "pre-" means "before" or "in advance", as in preview, prepare, prevent.', 12, 1, 1, true),
        (spelling_module_id, 'Spell the word meaning "to make clear or explain":', 'dictation', 'clarify', 'Clarify (c-l-a-r-i-f-y) - from Latin "clarus" meaning "clear"', 13, 1, 2, true),
        (spelling_module_id, 'Which is correct: "definitely" or "definately"?', 'multiple_choice', 'A', 'The correct spelling is "definitely" - remember "finite" is in the middle.', 14, 1, 1, true);
        
        -- Add options for the spelling question
        INSERT INTO question_options (question_id, option_text, is_correct, order_index)
        SELECT q.id, 'A) definitely', true, 1 FROM questions q WHERE q.module_id = spelling_module_id AND q.order_index = 14
        UNION ALL
        SELECT q.id, 'B) definately', false, 2 FROM questions q WHERE q.module_id = spelling_module_id AND q.order_index = 14;
    END IF;

    -- =====================================================
    -- FIX PRACTICE TEST QUESTIONS LINKING
    -- =====================================================
    
    -- Clear existing practice test questions that might be broken
    DELETE FROM practice_test_questions;
    
    -- Re-link questions to practice tests properly
    -- CS Practice Test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT pt.id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM practice_tests pt
    JOIN subjects s ON pt.subject_id = s.id
    JOIN learning_paths lp ON lp.subject_id = s.id
    JOIN path_modules pm ON pm.learning_path_id = lp.id
    JOIN questions q ON q.module_id = pm.id
    WHERE s.name = 'computer_science' 
    AND pt.test_type = 'practice'
    AND q.is_active = true
    LIMIT 8;
    
    -- Math Practice Test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT pt.id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM practice_tests pt
    JOIN subjects s ON pt.subject_id = s.id
    JOIN learning_paths lp ON lp.subject_id = s.id
    JOIN path_modules pm ON pm.learning_path_id = lp.id
    JOIN questions q ON q.module_id = pm.id
    WHERE s.name = 'mathematics' 
    AND pt.test_type = 'practice'
    AND q.is_active = true
    LIMIT 6;
    
    -- Science Practice Test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT pt.id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM practice_tests pt
    JOIN subjects s ON pt.subject_id = s.id
    JOIN learning_paths lp ON lp.subject_id = s.id
    JOIN path_modules pm ON pm.learning_path_id = lp.id
    JOIN questions q ON q.module_id = pm.id
    WHERE s.name = 'science' 
    AND pt.test_type = 'practice'
    AND q.is_active = true
    LIMIT 5;
    
    -- Literature Practice Test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT pt.id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM practice_tests pt
    JOIN subjects s ON pt.subject_id = s.id
    JOIN learning_paths lp ON lp.subject_id = s.id
    JOIN path_modules pm ON pm.learning_path_id = lp.id
    JOIN questions q ON q.module_id = pm.id
    WHERE s.name = 'literature' 
    AND pt.test_type = 'practice'
    AND q.is_active = true
    LIMIT 4;
    
    -- Spelling Practice Test
    INSERT INTO practice_test_questions (practice_test_id, question_id, order_index, points)
    SELECT pt.id, q.id, ROW_NUMBER() OVER (ORDER BY q.order_index), q.points
    FROM practice_tests pt
    JOIN subjects s ON pt.subject_id = s.id
    JOIN learning_paths lp ON lp.subject_id = s.id
    JOIN path_modules pm ON pm.learning_path_id = lp.id
    JOIN questions q ON q.module_id = pm.id
    WHERE s.name = 'spelling' 
    AND pt.test_type = 'practice'
    AND q.is_active = true
    LIMIT 4;

    -- =====================================================
    -- UPDATE PRACTICE TEST TOTAL POINTS
    -- =====================================================
    
    -- Update total points for all practice tests based on linked questions
    UPDATE practice_tests 
    SET total_points = (
        SELECT COALESCE(SUM(ptq.points), 0)
        FROM practice_test_questions ptq 
        WHERE ptq.practice_test_id = practice_tests.id
    );

    RAISE NOTICE 'Practice tests fixed and content added!';
    RAISE NOTICE 'Added % new CS questions', 5;
    RAISE NOTICE 'Added % new Math questions', 5;
    RAISE NOTICE 'Added % new Science questions', 5;
    RAISE NOTICE 'Added % new Literature questions', 5;
    RAISE NOTICE 'Added % new Spelling questions', 5;
    RAISE NOTICE 'Fixed practice test question linking';
    RAISE NOTICE 'Added CS resources';

END $$;
