-- =============================================================================
-- UIL Academy - Add User Auto-Creation Trigger
-- =============================================================================
-- This script adds a database trigger to automatically create user records
-- when new users sign up through Supabase Auth
-- =============================================================================

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'student'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user record on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- ✅ User auto-creation trigger has been added!
-- 
-- From now on, whenever a new user signs up through Supabase Auth:
-- 1. A record will be created in auth.users (handled by Supabase)
-- 2. A corresponding record will be automatically created in public.users
-- 3. The user will be able to start learning paths immediately
--
-- To test:
-- 1. Sign up a new user
-- 2. Check that they appear in both auth.users and public.users tables
-- 3. Try starting a learning path - it should work without errors
