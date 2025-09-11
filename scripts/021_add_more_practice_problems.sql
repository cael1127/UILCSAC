-- Purpose: Add more practice problems and sample test cases without affecting users
-- Safe to run multiple times: guards on title uniqueness

-- Arrays: Two Sum Variations
WITH p AS (
  INSERT INTO problems (title, description, difficulty_level, category, points, time_limit, memory_limit, programming_language, categories)
  SELECT 'Two Sum (Hash Map Variant)',
         'Return indices of the two numbers that add up to target using an O(n) approach.',
         1,
         'Arrays',
         50,
         2000,
         64,
         'java',
         'Arrays,HashMap'
  WHERE NOT EXISTS (SELECT 1 FROM problems WHERE title = 'Two Sum (Hash Map Variant)')
  RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
SELECT p.id, tc.input, tc.expected_output, tc.is_sample, tc.points
FROM p
CROSS JOIN (
  VALUES
    ('{"nums": [2,7,11,15], "target": 9}', '[0,1]', true, 20),
    ('{"nums": [3,2,4], "target": 6}', '[1,2]', false, 20),
    ('{"nums": [3,3], "target": 6}', '[0,1]', false, 20)
) AS tc(input, expected_output, is_sample, points);

-- Strings: Valid Anagram
WITH p AS (
  INSERT INTO problems (title, description, difficulty_level, category, points, time_limit, memory_limit, programming_language, categories)
  SELECT 'Valid Anagram',
         'Given two strings s and t, return true if t is an anagram of s.',
         1,
         'Strings',
         50,
         2000,
         64,
         'java',
         'Strings,Hashing'
  WHERE NOT EXISTS (SELECT 1 FROM problems WHERE title = 'Valid Anagram')
  RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
SELECT p.id, tc.input, tc.expected_output, tc.is_sample, tc.points
FROM p
CROSS JOIN (
  VALUES
    ('{"s": "anagram", "t": "nagaram"}', 'true', true, 20),
    ('{"s": "rat", "t": "car"}', 'false', false, 20)
) AS tc(input, expected_output, is_sample, points);

-- Math: FizzBuzz
WITH p AS (
  INSERT INTO problems (title, description, difficulty_level, category, points, time_limit, memory_limit, programming_language, categories)
  SELECT 'FizzBuzz',
         'Print numbers from 1..n; multiples of 3 -> Fizz, 5 -> Buzz, both -> FizzBuzz.',
         1,
         'Math',
         40,
         2000,
         64,
         'java',
         'Math,Implementation'
  WHERE NOT EXISTS (SELECT 1 FROM problems WHERE title = 'FizzBuzz')
  RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
SELECT p.id, tc.input, tc.expected_output, tc.is_sample, tc.points
FROM p
CROSS JOIN (
  VALUES
    ('{"n": 3}', '["1","2","Fizz"]', true, 20),
    ('{"n": 5}', '["1","2","Fizz","4","Buzz"]', false, 20)
) AS tc(input, expected_output, is_sample, points);

-- DP: Climbing Stairs
WITH p AS (
  INSERT INTO problems (title, description, difficulty_level, category, points, time_limit, memory_limit, programming_language, categories)
  SELECT 'Climbing Stairs',
         'You can climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
         2,
         'Dynamic Programming',
         70,
         2000,
         64,
         'java',
         'Dynamic Programming'
  WHERE NOT EXISTS (SELECT 1 FROM problems WHERE title = 'Climbing Stairs')
  RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
SELECT p.id, tc.input, tc.expected_output, tc.is_sample, tc.points
FROM p
CROSS JOIN (
  VALUES
    ('{"n": 2}', '2', true, 20),
    ('{"n": 3}', '3', false, 20),
    ('{"n": 4}', '5', false, 20)
) AS tc(input, expected_output, is_sample, points);

-- Trees: Max Depth of Binary Tree (signature-only tests)
WITH p AS (
  INSERT INTO problems (title, description, difficulty_level, category, points, time_limit, memory_limit, programming_language, categories)
  SELECT 'Maximum Depth of Binary Tree',
         'Given the root of a binary tree, return its maximum depth.',
         2,
         'Trees',
         80,
         2000,
         64,
         'java',
         'Trees,BFS,DFS'
  WHERE NOT EXISTS (SELECT 1 FROM problems WHERE title = 'Maximum Depth of Binary Tree')
  RETURNING id
)
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points)
SELECT p.id, tc.input, tc.expected_output, tc.is_sample, tc.points
FROM p
CROSS JOIN (
  VALUES
    ('{"root": [3,9,20,null,null,15,7]}', '3', true, 20)
) AS tc(input, expected_output, is_sample, points);

-- Note: This script only inserts; it does not modify or delete users or prior data.

