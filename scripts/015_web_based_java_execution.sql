-- Web-Based Java Execution System
-- This script adds web-based Java execution capabilities for devices without Java installation

-- Create a web-based execution environment table
CREATE TABLE IF NOT EXISTS web_execution_environments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    language VARCHAR(50) NOT NULL, -- java, python, cpp, javascript
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    execution_timeout_ms INTEGER DEFAULT 5000,
    memory_limit_mb INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create execution results table
CREATE TABLE IF NOT EXISTS web_execution_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    execution_environment_id UUID NOT NULL REFERENCES web_execution_environments(id),
    code_input TEXT NOT NULL,
    execution_output TEXT,
    execution_error TEXT,
    execution_time_ms INTEGER,
    memory_used_mb DECIMAL(10,2),
    status VARCHAR(50) NOT NULL, -- success, error, timeout, memory_exceeded
    test_results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predefined test cases for common problems
CREATE TABLE IF NOT EXISTS predefined_test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    input_data JSONB NOT NULL,
    expected_output JSONB NOT NULL,
    test_description TEXT,
    is_hidden BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert web execution environments
INSERT INTO web_execution_environments (name, description, language, version, execution_timeout_ms, memory_limit_mb) VALUES
('Java Web Runtime', 'Web-based Java execution environment using JavaScript interpreter', 'java', '11', 10000, 100),
('Python Web Runtime', 'Web-based Python execution environment using Pyodide', 'python', '3.9', 8000, 80),
('C++ Web Runtime', 'Web-based C++ execution environment using WebAssembly', 'cpp', '17', 12000, 120),
('JavaScript Runtime', 'Native JavaScript execution environment', 'javascript', 'ES2020', 5000, 50);

-- Insert predefined test cases for common Java problems
INSERT INTO predefined_test_cases (question_id, test_name, input_data, expected_output, test_description, order_index) VALUES

-- Two Sum test cases
((SELECT id FROM questions WHERE title LIKE '%Two Sum%' LIMIT 1), 
 'Basic Two Sum', 
 '{"nums": [2, 7, 11, 15], "target": 9}', 
 '{"result": [0, 1], "explanation": "nums[0] + nums[1] = 2 + 7 = 9"}', 
 'Basic test case with two numbers that sum to target', 1),

((SELECT id FROM questions WHERE title LIKE '%Two Sum%' LIMIT 1), 
 'Two Sum with Duplicates', 
 '{"nums": [3, 2, 4], "target": 6}', 
 '{"result": [1, 2], "explanation": "nums[1] + nums[2] = 2 + 4 = 6"}', 
 'Test case with duplicate numbers', 2),

((SELECT id FROM questions WHERE title LIKE '%Two Sum%' LIMIT 1), 
 'Two Sum Edge Case', 
 '{"nums": [3, 3], "target": 6}', 
 '{"result": [0, 1], "explanation": "nums[0] + nums[1] = 3 + 3 = 6"}', 
 'Edge case with same numbers', 3),

-- Palindrome test cases
((SELECT id FROM questions WHERE title LIKE '%Palindrome%' LIMIT 1), 
 'Simple Palindrome', 
 '{"input": "racecar"}', 
 '{"result": true, "explanation": "racecar reads the same forwards and backwards"}', 
 'Simple palindrome test', 1),

((SELECT id FROM questions WHERE title LIKE '%Palindrome%' LIMIT 1), 
 'Palindrome with Spaces', 
 '{"input": "A man a plan a canal Panama"}', 
 '{"result": true, "explanation": "Ignoring spaces and case, this is a palindrome"}', 
 'Palindrome with spaces and mixed case', 2),

((SELECT id FROM questions WHERE title LIKE '%Palindrome%' LIMIT 1), 
 'Not a Palindrome', 
 '{"input": "hello"}', 
 '{"result": false, "explanation": "hello is not a palindrome"}', 
 'Non-palindrome test', 3),

-- Fibonacci test cases
((SELECT id FROM questions WHERE title LIKE '%Fibonacci%' LIMIT 1), 
 'Fibonacci Base Cases', 
 '{"n": 0}', 
 '{"result": 0, "explanation": "F(0) = 0 by definition"}', 
 'Base case F(0)', 1),

((SELECT id FROM questions WHERE title LIKE '%Fibonacci%' LIMIT 1), 
 'Fibonacci Base Cases 2', 
 '{"n": 1}', 
 '{"result": 1, "explanation": "F(1) = 1 by definition"}', 
 'Base case F(1)', 2),

((SELECT id FROM questions WHERE title LIKE '%Fibonacci%' LIMIT 1), 
 'Fibonacci Small Number', 
 '{"n": 5}', 
 '{"result": 5, "explanation": "F(5) = F(4) + F(3) = 3 + 2 = 5"}', 
 'Small Fibonacci number', 3),

-- Array Sorting test cases
((SELECT id FROM questions WHERE title LIKE '%Array%' AND title LIKE '%Sort%' LIMIT 1), 
 'Basic Array Sort', 
 '{"array": [64, 34, 25, 12, 22, 11, 90]}', 
 '{"result": [11, 12, 22, 25, 34, 64, 90], "explanation": "Array sorted in ascending order"}', 
 'Basic array sorting test', 1),

((SELECT id FROM questions WHERE title LIKE '%Array%' AND title LIKE '%Sort%' LIMIT 1), 
 'Array with Duplicates', 
 '{"array": [3, 1, 4, 1, 5, 9, 2, 6]}', 
 '{"result": [1, 1, 2, 3, 4, 5, 6, 9], "explanation": "Array with duplicates sorted"}', 
 'Array with duplicate elements', 2),

-- String Reversal test cases
((SELECT id FROM questions WHERE title LIKE '%String%' AND title LIKE '%Reverse%' LIMIT 1), 
 'Basic String Reverse', 
 '{"input": "hello"}', 
 '{"result": "olleh", "explanation": "String reversed character by character"}', 
 'Basic string reversal', 1),

((SELECT id FROM questions WHERE title LIKE '%String%' AND title LIKE '%Reverse%' LIMIT 1), 
 'Empty String', 
 '{"input": ""}', 
 '{"result": "", "explanation": "Empty string remains empty when reversed"}', 
 'Empty string edge case', 2),

-- Prime Number test cases
((SELECT id FROM questions WHERE title LIKE '%Prime%' LIMIT 1), 
 'Prime Numbers', 
 '{"input": 17}', 
 '{"result": true, "explanation": "17 is only divisible by 1 and itself"}', 
 'Prime number test', 1),

((SELECT id FROM questions WHERE title LIKE '%Prime%' LIMIT 1), 
 'Non-Prime Numbers', 
 '{"input": 15}', 
 '{"result": false, "explanation": "15 is divisible by 3 and 5"}', 
 'Non-prime number test', 2),

-- Tree Depth test cases
((SELECT id FROM questions WHERE title LIKE '%Tree%' AND title LIKE '%Depth%' LIMIT 1), 
 'Simple Tree', 
 '{"tree": {"val": 3, "left": {"val": 9}, "right": {"val": 20, "left": {"val": 15}, "right": {"val": 7}}}}', 
 '{"result": 3, "explanation": "Maximum depth is 3 levels"}', 
 'Simple binary tree depth test', 1),

-- Climbing Stairs test cases
((SELECT id FROM questions WHERE title LIKE '%Climb%' AND title LIKE '%Stairs%' LIMIT 1), 
 'Small Number of Stairs', 
 '{"n": 3}', 
 '{"result": 3, "explanation": "3 ways: 1+1+1, 1+2, 2+1"}', 
 'Small number of stairs', 1),

((SELECT id FROM questions WHERE title LIKE '%Climb%' AND title LIKE '%Stairs%' LIMIT 1), 
 'Base Cases', 
 '{"n": 1}', 
 '{"result": 1, "explanation": "Only 1 way to climb 1 stair"}', 
 'Base case with 1 stair', 2);

-- Create a sandboxed execution environment configuration
CREATE TABLE IF NOT EXISTS execution_sandbox_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    environment_id UUID NOT NULL REFERENCES web_execution_environments(id),
    max_execution_time_ms INTEGER NOT NULL DEFAULT 10000,
    max_memory_mb INTEGER NOT NULL DEFAULT 100,
    max_output_length INTEGER NOT NULL DEFAULT 10000,
    allowed_imports TEXT[] DEFAULT '{}',
    blocked_functions TEXT[] DEFAULT ARRAY['System.exit', 'Runtime.exec', 'ProcessBuilder'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sandbox configurations
INSERT INTO execution_sandbox_config (environment_id, max_execution_time_ms, max_memory_mb, max_output_length, allowed_imports, blocked_functions) VALUES
((SELECT id FROM web_execution_environments WHERE name = 'Java Web Runtime'), 10000, 100, 10000, 
 ARRAY['java.util.*', 'java.lang.Math', 'java.lang.String'], 
 ARRAY['System.exit', 'Runtime.exec', 'ProcessBuilder', 'System.gc', 'System.load']),

((SELECT id FROM web_execution_environments WHERE name = 'Python Web Runtime'), 8000, 80, 8000, 
 ARRAY['math', 'random', 'collections'], 
 ARRAY['os.system', 'subprocess.call', 'eval', 'exec']),

((SELECT id FROM web_execution_environments WHERE name = 'C++ Web Runtime'), 12000, 120, 12000, 
 ARRAY['iostream', 'vector', 'string', 'algorithm'], 
 ARRAY['system', 'popen', 'fork', 'exec']);

-- Create execution performance metrics
CREATE TABLE IF NOT EXISTS execution_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    execution_result_id UUID NOT NULL REFERENCES web_execution_results(id) ON DELETE CASCADE,
    execution_time_ms INTEGER NOT NULL,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for new tables
ALTER TABLE web_execution_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_execution_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE predefined_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_sandbox_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Web execution environments policies
CREATE POLICY "Allow authenticated users to read execution environments" ON web_execution_environments
    FOR SELECT TO authenticated USING (is_active = true);

-- Web execution results policies
CREATE POLICY "Allow users to manage own execution results" ON web_execution_results
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Predefined test cases policies
CREATE POLICY "Allow authenticated users to read test cases" ON predefined_test_cases
    FOR SELECT TO authenticated USING (true);

-- Execution sandbox config policies
CREATE POLICY "Allow authenticated users to read sandbox config" ON execution_sandbox_config
    FOR SELECT TO authenticated USING (is_active = true);

-- Execution performance metrics policies
CREATE POLICY "Allow users to manage own performance metrics" ON execution_performance_metrics
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT SELECT ON web_execution_environments TO authenticated;
GRANT ALL ON web_execution_results TO authenticated;
GRANT SELECT ON predefined_test_cases TO authenticated;
GRANT SELECT ON execution_sandbox_config TO authenticated;
GRANT ALL ON execution_performance_metrics TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_web_execution_results_user ON web_execution_results(user_id);
CREATE INDEX IF NOT EXISTS idx_web_execution_results_question ON web_execution_results(question_id);
CREATE INDEX IF NOT EXISTS idx_predefined_test_cases_question ON predefined_test_cases(question_id);
CREATE INDEX IF NOT EXISTS idx_execution_performance_metrics_user ON execution_performance_metrics(user_id);

-- Update questions to include web execution support
ALTER TABLE questions ADD COLUMN IF NOT EXISTS supports_web_execution BOOLEAN DEFAULT true;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS web_execution_template TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS expected_function_signature TEXT;

-- Update existing questions with web execution support
UPDATE questions SET 
    supports_web_execution = true,
    web_execution_template = 'public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{0, 0};
    }
    
    public static void main(String[] args) {
        // Test your solution
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Result: [" + result[0] + ", " + result[1] + "]");
    }
}',
    expected_function_signature = 'twoSum(int[] nums, int target)'
WHERE title LIKE '%Two Sum%';

UPDATE questions SET 
    supports_web_execution = true,
    web_execution_template = 'public class Solution {
    public static boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
    
    public static void main(String[] args) {
        // Test your solution
        String test = "racecar";
        boolean result = isPalindrome(test);
        System.out.println("Is palindrome: " + result);
    }
}',
    expected_function_signature = 'isPalindrome(String s)'
WHERE title LIKE '%Palindrome%';

UPDATE questions SET 
    supports_web_execution = true,
    web_execution_template = 'public class Solution {
    public static int fibonacci(int n) {
        // Your code here
        return 0;
    }
    
    public static void main(String[] args) {
        // Test your solution
        int n = 5;
        int result = fibonacci(n);
        System.out.println("Fibonacci(" + n + ") = " + result);
    }
}',
    expected_function_signature = 'fibonacci(int n)'
WHERE title LIKE '%Fibonacci%';

-- Create a comprehensive web execution system summary
SELECT 
    'Web Execution Environments' as metric,
    COUNT(*) as count
FROM web_execution_environments

UNION ALL

SELECT 
    'Predefined Test Cases' as metric,
    COUNT(*) as count
FROM predefined_test_cases

UNION ALL

SELECT 
    'Questions with Web Execution Support' as metric,
    COUNT(*) as count
FROM questions 
WHERE supports_web_execution = true

UNION ALL

SELECT 
    'Sandbox Configurations' as metric,
    COUNT(*) as count
FROM execution_sandbox_config

UNION ALL

SELECT 
    'Supported Languages' as metric,
    COUNT(DISTINCT language) as count
FROM web_execution_environments;

