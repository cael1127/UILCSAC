-- Comprehensive Questions Enhancement
-- This script adds more questions covering more concepts and makes quizzes longer

-- First, let's add more comprehensive questions to existing modules
INSERT INTO questions (path_module_id, title, description, question_type_id, points, order_index, concept_tags, difficulty_level, time_limit_seconds, max_attempts) VALUES

-- Module 1: Java Basics - Additional Questions
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Java Memory Management',
 'Which of the following statements about Java memory management is correct?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 15, 4,
 ARRAY['memory_management', 'jvm', 'garbage_collection'], 2, 150, 3),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Package and Import System',
 'What is the correct order of elements in a Java source file?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 12, 5,
 ARRAY['packages', 'imports', 'syntax', 'file_structure'], 2, 120, 3),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Access Modifiers',
 'Which access modifier allows access from any class in the same package and any subclass?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 10, 6,
 ARRAY['access_modifiers', 'encapsulation', 'oop'], 2, 120, 3),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'String Manipulation',
 'Write a method that takes a string and returns the number of vowels it contains.',
 (SELECT id FROM question_types WHERE name = 'written'), 20, 7,
 ARRAY['strings', 'loops', 'conditionals', 'methods'], 2, 300, 3),

-- Module 2: Control Structures - Additional Questions
((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Nested Control Structures',
 'What is the output of the following nested if-else structure?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 15, 3,
 ARRAY['nested_control', 'logic', 'conditionals'], 3, 180, 3),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Loop Optimization',
 'Which loop structure is most efficient for iterating through an array when you need the index?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 12, 4,
 ARRAY['loop_optimization', 'performance', 'arrays'], 2, 150, 3),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Pattern Printing',
 'Write a program to print a right triangle pattern using asterisks (*).',
 (SELECT id FROM question_types WHERE name = 'written'), 25, 5,
 ARRAY['nested_loops', 'pattern_printing', 'control_flow'], 3, 360, 3),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Switch Statement Fall-through',
 'What happens if you forget to include a break statement in a switch case?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 10, 6,
 ARRAY['switch_statement', 'fall_through', 'control_flow'], 2, 120, 3),

-- Module 3: Object-Oriented Programming - Additional Questions
((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Constructor Chaining',
 'How can you call one constructor from another constructor in the same class?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 15, 3,
 ARRAY['constructors', 'constructor_chaining', 'this_keyword'], 3, 180, 3),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Method Overloading vs Overriding',
 'What is the difference between method overloading and method overriding?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 18, 4,
 ARRAY['method_overloading', 'method_overriding', 'polymorphism'], 3, 240, 3),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Abstract Classes and Interfaces',
 'When would you use an abstract class instead of an interface?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 20, 5,
 ARRAY['abstract_classes', 'interfaces', 'design_patterns'], 4, 300, 3),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Design a Bank Account System',
 'Design a class hierarchy for a bank account system with different account types.',
 (SELECT id FROM question_types WHERE name = 'written'), 35, 6,
 ARRAY['class_design', 'inheritance', 'encapsulation', 'real_world_modeling'], 4, 600, 3),

-- Module 4: Data Structures - Additional Questions
((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'ArrayList vs LinkedList',
 'When would you choose ArrayList over LinkedList for storing elements?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 15, 2,
 ARRAY['arraylist', 'linkedlist', 'performance', 'data_structures'], 3, 180, 3),

((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'HashMap Implementation',
 'How does HashMap handle collisions in Java?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 18, 3,
 ARRAY['hashmap', 'collision_resolution', 'hashing'], 3, 240, 3),

((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Stack and Queue Operations',
 'Implement a stack using two queues.',
 (SELECT id FROM question_types WHERE name = 'written'), 30, 4,
 ARRAY['stacks', 'queues', 'data_structure_implementation'], 4, 480, 3),

((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Tree Traversal',
 'What are the three main ways to traverse a binary tree?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 15, 5,
 ARRAY['trees', 'traversal', 'recursion'], 3, 180, 3),

-- Module 5: Algorithms - Additional Questions
((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Time Complexity Analysis',
 'What is the time complexity of the following algorithm?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 20, 3,
 ARRAY['time_complexity', 'algorithm_analysis', 'big_o'], 4, 300, 3),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Dynamic Programming',
 'Explain the concept of dynamic programming and provide an example.',
 (SELECT id FROM question_types WHERE name = 'written'), 40, 4,
 ARRAY['dynamic_programming', 'optimization', 'memoization'], 5, 720, 3),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Graph Algorithms',
 'What is the difference between BFS and DFS? When would you use each?',
 (SELECT id FROM question_types WHERE name = 'multiple_choice'), 25, 5,
 ARRAY['graphs', 'bfs', 'dfs', 'algorithm_choice'], 4, 360, 3),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Recursion vs Iteration',
 'Convert the following recursive function to an iterative version.',
 (SELECT id FROM question_types WHERE name = 'written'), 35, 6,
 ARRAY['recursion', 'iteration', 'algorithm_conversion'], 4, 600, 3);

-- Now let's add more question options for the new multiple choice questions
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES

-- Java Memory Management options
((SELECT id FROM questions WHERE title = 'Java Memory Management' LIMIT 1), 'Java uses manual memory management like C++', false, 1),
((SELECT id FROM questions WHERE title = 'Java Memory Management' LIMIT 1), 'The JVM automatically handles garbage collection', true, 2),
((SELECT id FROM questions WHERE title = 'Java Memory Management' LIMIT 1), 'Memory leaks are impossible in Java', false, 3),
((SELECT id FROM questions WHERE title = 'Java Memory Management' LIMIT 1), 'Developers must explicitly free memory', false, 4),

-- Package and Import System options
((SELECT id FROM questions WHERE title = 'Package and Import System' LIMIT 1), 'Package, Imports, Class, Main Method', true, 1),
((SELECT id FROM questions WHERE title = 'Package and Import System' LIMIT 1), 'Class, Package, Imports, Main Method', false, 2),
((SELECT id FROM questions WHERE title = 'Package and Import System' LIMIT 1), 'Main Method, Class, Package, Imports', false, 3),
((SELECT id FROM questions WHERE title = 'Package and Import System' LIMIT 1), 'Imports, Package, Class, Main Method', false, 4),

-- Access Modifiers options
((SELECT id FROM questions WHERE title = 'Access Modifiers' LIMIT 1), 'private', false, 1),
((SELECT id FROM questions WHERE title = 'Access Modifiers' LIMIT 1), 'public', false, 2),
((SELECT id FROM questions WHERE title = 'Access Modifiers' LIMIT 1), 'protected', true, 3),
((SELECT id FROM questions WHERE title = 'Access Modifiers' LIMIT 1), 'default (package-private)', false, 4),

-- Nested Control Structures options
((SELECT id FROM questions WHERE title = 'Nested Control Structures' LIMIT 1), 'Output depends on the specific conditions', true, 1),
((SELECT id FROM questions WHERE title = 'Nested Control Structures' LIMIT 1), 'Always executes the innermost if block', false, 2),
((SELECT id FROM questions WHERE title = 'Nested Control Structures' LIMIT 1), 'Only executes if all conditions are true', false, 3),
((SELECT id FROM questions WHERE title = 'Nested Control Structures' LIMIT 1), 'Never executes nested blocks', false, 4),

-- Loop Optimization options
((SELECT id FROM questions WHERE title = 'Loop Optimization' LIMIT 1), 'while loop', false, 1),
((SELECT id FROM questions WHERE title = 'Loop Optimization' LIMIT 1), 'for loop', true, 2),
((SELECT id FROM questions WHERE title = 'Loop Optimization' LIMIT 1), 'do-while loop', false, 3),
((SELECT id FROM questions WHERE title = 'Loop Optimization' LIMIT 1), 'enhanced for loop', false, 4),

-- Switch Statement Fall-through options
((SELECT id FROM questions WHERE title = 'Switch Statement Fall-through' LIMIT 1), 'Compilation error', false, 1),
((SELECT id FROM questions WHERE title = 'Switch Statement Fall-through' LIMIT 1), 'Runtime error', false, 2),
((SELECT id FROM questions WHERE title = 'Switch Statement Fall-through' LIMIT 1), 'Execution continues to the next case', true, 3),
((SELECT id FROM questions WHERE title = 'Switch Statement Fall-through' LIMIT 1), 'Program terminates', false, 4),

-- Constructor Chaining options
((SELECT id FROM questions WHERE title = 'Constructor Chaining' LIMIT 1), 'Using the super() keyword', false, 1),
((SELECT id FROM questions WHERE title = 'Constructor Chaining' LIMIT 1), 'Using the this() keyword', true, 2),
((SELECT id FROM questions WHERE title = 'Constructor Chaining' LIMIT 1), 'Using the new keyword', false, 3),
((SELECT id FROM questions WHERE title = 'Constructor Chaining' LIMIT 1), 'Using the return keyword', false, 4),

-- Method Overloading vs Overriding options
((SELECT id FROM questions WHERE title = 'Method Overloading vs Overriding' LIMIT 1), 'Overloading is compile-time, Overriding is runtime', true, 1),
((SELECT id FROM questions WHERE title = 'Method Overloading vs Overriding' LIMIT 1), 'Overriding is compile-time, Overloading is runtime', false, 2),
((SELECT id FROM questions WHERE title = 'Method Overloading vs Overriding' LIMIT 1), 'Both are compile-time', false, 3),
((SELECT id FROM questions WHERE title = 'Method Overloading vs Overriding' LIMIT 1), 'Both are runtime', false, 4),

-- Abstract Classes and Interfaces options
((SELECT id FROM questions WHERE title = 'Abstract Classes and Interfaces' LIMIT 1), 'When you need to provide default implementations', true, 1),
((SELECT id FROM questions WHERE title = 'Abstract Classes and Interfaces' LIMIT 1), 'When you need multiple inheritance', false, 2),
((SELECT id FROM questions WHERE title = 'Abstract Classes and Interfaces' LIMIT 1), 'When you need to define constants', false, 3),
((SELECT id FROM questions WHERE title = 'Abstract Classes and Interfaces' LIMIT 1), 'When you need static methods only', false, 4),

-- ArrayList vs LinkedList options
((SELECT id FROM questions WHERE title = 'ArrayList vs LinkedList' LIMIT 1), 'When you need frequent insertions and deletions', false, 1),
((SELECT id FROM questions WHERE title = 'ArrayList vs LinkedList' LIMIT 1), 'When you need random access to elements', true, 2),
((SELECT id FROM questions WHERE title = 'ArrayList vs LinkedList' LIMIT 1), 'When memory usage is a concern', false, 3),
((SELECT id FROM questions WHERE title = 'ArrayList vs LinkedList' LIMIT 1), 'When you need to maintain insertion order', false, 4),

-- HashMap Implementation options
((SELECT id FROM questions WHERE title = 'HashMap Implementation' LIMIT 1), 'Using separate chaining with linked lists', true, 1),
((SELECT id FROM questions WHERE title = 'HashMap Implementation' LIMIT 1), 'Using open addressing only', false, 2),
((SELECT id FROM questions WHERE title = 'HashMap Implementation' LIMIT 1), 'Using binary search trees', false, 3),
((SELECT id FROM questions WHERE title = 'HashMap Implementation' LIMIT 1), 'Using arrays only', false, 4),

-- Tree Traversal options
((SELECT id FROM questions WHERE title = 'Tree Traversal' LIMIT 1), 'Inorder, Preorder, Postorder', true, 1),
((SELECT id FROM questions WHERE title = 'Tree Traversal' LIMIT 1), 'Left, Right, Root', false, 2),
((SELECT id FROM questions WHERE title = 'Tree Traversal' LIMIT 1), 'Depth, Breadth, Level', false, 3),
((SELECT id FROM questions WHERE title = 'Tree Traversal' LIMIT 1), 'Forward, Backward, Circular', false, 4),

-- Time Complexity Analysis options
((SELECT id FROM questions WHERE title = 'Time Complexity Analysis' LIMIT 1), 'O(1)', false, 1),
((SELECT id FROM questions WHERE title = 'Time Complexity Analysis' LIMIT 1), 'O(n)', false, 2),
((SELECT id FROM questions WHERE title = 'Time Complexity Analysis' LIMIT 1), 'O(n²)', false, 3),
((SELECT id FROM questions WHERE title = 'Time Complexity Analysis' LIMIT 1), 'Depends on the specific algorithm', true, 4),

-- Graph Algorithms options
((SELECT id FROM questions WHERE title = 'Graph Algorithms' LIMIT 1), 'BFS uses a stack, DFS uses a queue', false, 1),
((SELECT id FROM questions WHERE title = 'Graph Algorithms' LIMIT 1), 'BFS uses a queue, DFS uses a stack', true, 2),
((SELECT id FROM questions WHERE title = 'Graph Algorithms' LIMIT 1), 'Both use the same data structure', false, 3),
((SELECT id FROM questions WHERE title = 'Graph Algorithms' LIMIT 1), 'BFS uses recursion, DFS uses iteration', false, 4);

-- Now let's add more advanced questions that combine multiple concepts
INSERT INTO questions (path_module_id, title, description, question_type_id, points, order_index, concept_tags, difficulty_level, time_limit_seconds, max_attempts) VALUES

-- Advanced Integrated Questions
((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'Design Pattern Implementation',
 'Implement the Singleton design pattern with thread safety and explain your approach.',
 (SELECT id FROM question_types WHERE name = 'written'), 45, 7,
 ARRAY['design_patterns', 'thread_safety', 'singleton', 'advanced_oop'], 5, 900, 3),

((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Custom Data Structure',
 'Design and implement a custom data structure that combines the benefits of both a stack and a queue.',
 (SELECT id FROM question_types WHERE name = 'written'), 50, 6,
 ARRAY['custom_data_structures', 'stacks', 'queues', 'design', 'implementation'], 5, 900, 3),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Algorithm Optimization',
 'Given a solution with O(n²) time complexity, optimize it to O(n log n) and explain the trade-offs.',
 (SELECT id FROM question_types WHERE name = 'written'), 55, 7,
 ARRAY['algorithm_optimization', 'complexity_analysis', 'trade_offs', 'advanced_algorithms'], 5, 900, 3),

((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Exception Handling and Resource Management',
 'Write a method that demonstrates proper exception handling and resource management using try-with-resources.',
 (SELECT id FROM question_types WHERE name = 'written'), 40, 8,
 ARRAY['exception_handling', 'resource_management', 'try_with_resources', 'best_practices'], 4, 600, 3),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Complex Logic Implementation',
 'Implement a state machine using control structures to process a sequence of commands.',
 (SELECT id FROM question_types WHERE name = 'written'), 45, 7,
 ARRAY['state_machines', 'complex_logic', 'control_structures', 'design'], 4, 720, 3);

-- Add more question options for advanced questions
INSERT INTO question_options (question_id, option_text, is_correct, order_index) VALUES

-- Advanced multiple choice questions (if any were added)
-- For now, let's focus on the written questions which don't need options

-- Let's also add some concept-based questions that test understanding across modules
INSERT INTO questions (path_module_id, title, description, question_type_id, points, order_index, concept_tags, difficulty_level, time_limit_seconds, max_attempts) VALUES

-- Cross-module concept questions
((SELECT id FROM path_modules WHERE title = 'Java Basics' LIMIT 1),
 'Memory and Performance',
 'Explain how Java''s memory model affects performance when working with large data structures.',
 (SELECT id FROM question_types WHERE name = 'written'), 35, 9,
 ARRAY['memory_model', 'performance', 'data_structures', 'jvm'], 4, 600, 3),

((SELECT id FROM path_modules WHERE title = 'Control Structures' LIMIT 1),
 'Algorithmic Thinking',
 'Design an algorithm to find the longest palindromic substring and implement it using appropriate control structures.',
 (SELECT id FROM question_types WHERE name = 'written'), 50, 8,
 ARRAY['algorithmic_thinking', 'palindrome', 'strings', 'control_structures', 'optimization'], 4, 720, 3),

((SELECT id FROM path_modules WHERE title = 'Object-Oriented Programming' LIMIT 1),
 'SOLID Principles',
 'Refactor the given code to follow SOLID principles and explain your changes.',
 (SELECT id FROM question_types WHERE name = 'written'), 45, 8,
 ARRAY['solid_principles', 'refactoring', 'code_quality', 'design_principles'], 5, 900, 3),

((SELECT id FROM path_modules WHERE title = 'Data Structures' LIMIT 1),
 'Data Structure Selection',
 'Given a specific problem scenario, choose the most appropriate data structure and justify your choice.',
 (SELECT id FROM question_types WHERE name = 'written'), 40, 7,
 ARRAY['data_structure_selection', 'problem_solving', 'justification', 'analysis'], 4, 600, 3),

((SELECT id FROM path_modules WHERE title = 'Algorithms' LIMIT 1),
 'Real-world Application',
 'Solve a real-world problem using appropriate algorithms and data structures, considering both time and space complexity.',
 (SELECT id FROM question_types WHERE name = 'written'), 55, 8,
 ARRAY['real_world_problems', 'algorithm_selection', 'complexity_analysis', 'practical_application'], 5, 900, 3);

-- Update existing questions to have more comprehensive concept tags
UPDATE questions SET 
    concept_tags = ARRAY['variables', 'data_types', 'syntax', 'basic_concepts'],
    difficulty_level = 1,
    time_limit_seconds = 150,
    max_attempts = 3
WHERE title LIKE '%Java%' OR title LIKE '%Variable%';

UPDATE questions SET 
    concept_tags = ARRAY['control_flow', 'conditionals', 'loops', 'logic'],
    difficulty_level = 2,
    time_limit_seconds = 200,
    max_attempts = 3
WHERE title LIKE '%Control%' OR title LIKE '%Loop%';

UPDATE questions SET 
    concept_tags = ARRAY['oop', 'classes', 'objects', 'inheritance', 'polymorphism'],
    difficulty_level = 3,
    time_limit_seconds = 300,
    max_attempts = 3
WHERE title LIKE '%Class%' OR title LIKE '%Object%';

UPDATE questions SET 
    concept_tags = ARRAY['data_structures', 'arrays', 'collections', 'performance'],
    difficulty_level = 3,
    time_limit_seconds = 360,
    max_attempts = 3
WHERE title LIKE '%Array%' OR title LIKE '%Collection%';

UPDATE questions SET 
    concept_tags = ARRAY['algorithms', 'searching', 'sorting', 'complexity', 'optimization'],
    difficulty_level = 4,
    time_limit_seconds = 420,
    max_attempts = 3
WHERE title LIKE '%Algorithm%' OR title LIKE '%Search%' OR title LIKE '%Sort%';

-- Create a comprehensive quiz structure
-- Each module now has 8-10 questions covering multiple concepts
-- Questions range from basic understanding to advanced application
-- Time limits are appropriate for the complexity level
-- Multiple attempts allow for learning from mistakes

-- Verify the enhanced question set
SELECT 
    'Total Questions' as metric,
    COUNT(*) as count
FROM questions

UNION ALL

SELECT 
    'Questions with Concept Tags' as metric,
    COUNT(*) as count
FROM questions 
WHERE concept_tags IS NOT NULL AND array_length(concept_tags, 1) > 0

UNION ALL

SELECT 
    'Advanced Questions (Level 4-5)' as metric,
    COUNT(*) as count
FROM questions 
WHERE difficulty_level >= 4

UNION ALL

SELECT 
    'Written Questions' as metric,
    COUNT(*) as count
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.name = 'written'

UNION ALL

SELECT 
    'Multiple Choice Questions' as metric,
    COUNT(*) as count
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.name = 'multiple_choice'

UNION ALL

SELECT 
    'Average Time Limit (minutes)' as metric,
    ROUND(AVG(time_limit_seconds) / 60.0, 1) as count
FROM questions
WHERE time_limit_seconds IS NOT NULL;

