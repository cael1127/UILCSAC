-- Alternative Fix: Change Foreign Keys to Reference auth.users
-- This approach modifies the existing tables to reference Supabase Auth users directly

-- First, let's drop the existing foreign key constraints
ALTER TABLE IF EXISTS user_learning_progress 
DROP CONSTRAINT IF EXISTS user_learning_progress_user_id_fkey;

ALTER TABLE IF EXISTS user_question_responses 
DROP CONSTRAINT IF EXISTS user_question_responses_user_id_fkey;

ALTER TABLE IF EXISTS user_progress 
DROP CONSTRAINT IF EXISTS user_progress_user_id_fkey;

ALTER TABLE IF EXISTS submissions 
DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;

ALTER TABLE IF EXISTS problems 
DROP CONSTRAINT IF EXISTS problems_created_by_fkey;

-- Now add new foreign key constraints that reference auth.users
ALTER TABLE user_learning_progress 
ADD CONSTRAINT user_learning_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_question_responses 
ADD CONSTRAINT user_question_responses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_progress 
ADD CONSTRAINT user_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE submissions 
ADD CONSTRAINT submissions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE problems 
ADD CONSTRAINT problems_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Verify the changes
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (tc.table_name LIKE '%user%' OR tc.table_name = 'problems' OR tc.table_name = 'submissions')
ORDER BY tc.table_name, tc.constraint_name;

-- Test the foreign key relationships
SELECT 
  'user_learning_progress' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM user_learning_progress

UNION ALL

SELECT 
  'user_question_responses' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM user_question_responses

UNION ALL

SELECT 
  'user_progress' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM user_progress

UNION ALL

SELECT 
  'submissions' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM submissions;
