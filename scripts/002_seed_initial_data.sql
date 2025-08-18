-- Seeding initial data for UIL CS Academy
-- Seed initial data for UIL Computer Science Academy

-- Insert difficulty levels
INSERT INTO difficulty_levels (name, level, color) VALUES
('Beginner', 1, '#10b981'), -- green
('Easy', 2, '#f59e0b'), -- yellow
('Medium', 3, '#f97316'), -- orange
('Hard', 4, '#ef4444'), -- red
('Expert', 5, '#8b5cf6') -- purple
ON CONFLICT (name) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, description, color) VALUES
('Arrays & Lists', 'Problems involving array manipulation and list operations', '#3b82f6'),
('Strings', 'String processing and manipulation problems', '#10b981'),
('Math & Number Theory', 'Mathematical problems and number theory', '#f59e0b'),
('Sorting & Searching', 'Problems involving sorting algorithms and search techniques', '#ef4444'),
('Dynamic Programming', 'Problems requiring dynamic programming solutions', '#8b5cf6'),
('Graph Theory', 'Graph traversal and graph algorithm problems', '#06b6d4'),
('Data Structures', 'Problems involving stacks, queues, trees, and other data structures', '#ec4899'),
('Recursion', 'Problems that can be solved using recursive approaches', '#f97316'),
('Greedy Algorithms', 'Problems best solved with greedy algorithmic approaches', '#84cc16'),
('Implementation', 'Straightforward implementation problems', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Insert sample problems
INSERT INTO problems (title, description, input_format, output_format, constraints, sample_input, sample_output, explanation, category_id, difficulty_id, time_limit, memory_limit, points) VALUES
(
    'Two Sum',
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    'First line contains n (number of elements) and target. Second line contains n space-separated integers.',
    'Two space-separated integers representing the indices (0-based) of the two numbers.',
    '2 ≤ n ≤ 10^4, -10^9 ≤ nums[i] ≤ 10^9, -10^9 ≤ target ≤ 10^9',
    '4 9
2 7 11 15',
    '0 1',
    'nums[0] + nums[1] = 2 + 7 = 9, so we return [0, 1].',
    (SELECT id FROM categories WHERE name = 'Arrays & Lists'),
    (SELECT id FROM difficulty_levels WHERE name = 'Easy'),
    2000,
    256,
    100
),
(
    'Palindrome Check',
    'Given a string, determine if it is a palindrome, considering only alphanumeric characters and ignoring cases.',
    'A single line containing a string s.',
    'Print "YES" if the string is a palindrome, "NO" otherwise.',
    '1 ≤ length of s ≤ 10^5',
    'A man a plan a canal Panama',
    'YES',
    'After removing non-alphanumeric characters and converting to lowercase: "amanaplanacanalpanama" is a palindrome.',
    (SELECT id FROM categories WHERE name = 'Strings'),
    (SELECT id FROM difficulty_levels WHERE name = 'Beginner'),
    1000,
    128,
    75
),
(
    'Fibonacci Sequence',
    'Calculate the nth Fibonacci number. The Fibonacci sequence is defined as: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1.',
    'A single integer n.',
    'The nth Fibonacci number.',
    '0 ≤ n ≤ 50',
    '10',
    '55',
    'F(10) = 55 in the Fibonacci sequence.',
    (SELECT id FROM categories WHERE name = 'Math & Number Theory'),
    (SELECT id FROM difficulty_levels WHERE name = 'Easy'),
    1500,
    128,
    80
);

-- Insert test cases for the problems
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, is_hidden, points) VALUES
-- Two Sum test cases
((SELECT id FROM problems WHERE title = 'Two Sum'), '4 9
2 7 11 15', '0 1', true, false, 0),
((SELECT id FROM problems WHERE title = 'Two Sum'), '3 6
3 2 4', '1 2', false, true, 50),
((SELECT id FROM problems WHERE title = 'Two Sum'), '2 6
3 3', '0 1', false, true, 50),

-- Palindrome Check test cases
((SELECT id FROM problems WHERE title = 'Palindrome Check'), 'A man a plan a canal Panama', 'YES', true, false, 0),
((SELECT id FROM problems WHERE title = 'Palindrome Check'), 'race a car', 'NO', false, true, 25),
((SELECT id FROM problems WHERE title = 'Palindrome Check'), 'Madam', 'YES', false, true, 25),
((SELECT id FROM problems WHERE title = 'Palindrome Check'), 'hello', 'NO', false, true, 25),

-- Fibonacci test cases
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence'), '10', '55', true, false, 0),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence'), '0', '0', false, true, 20),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence'), '1', '1', false, true, 20),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence'), '15', '610', false, true, 30),
((SELECT id FROM problems WHERE title = 'Fibonacci Sequence'), '20', '6765', false, true, 30);
