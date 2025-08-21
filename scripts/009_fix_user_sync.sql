-- Fix User Synchronization Issue
-- This script creates a trigger to automatically sync users between Supabase Auth and our custom users table

-- First, let's create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the new user into our custom users table
  INSERT INTO public.users (
    id,
    email,
    password_hash, -- We'll set this to a placeholder since Supabase handles auth
    first_name,
    last_name,
    role,
    created_at,
    updated_at,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    'supabase_auth_user', -- Placeholder since we don't have the actual password hash
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    'student',
    NEW.created_at,
    NEW.updated_at,
    true
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, update if needed
    UPDATE public.users 
    SET 
      email = NEW.email,
      updated_at = NEW.updated_at,
      last_login = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the trigger
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a trigger for user updates (like email changes)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user in our custom users table
  UPDATE public.users 
  SET 
    email = NEW.email,
    updated_at = NEW.updated_at,
    last_login = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the trigger
    RAISE WARNING 'Error in handle_user_update trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Now let's sync any existing users that might not be in our table
-- This will handle users who signed up before we added the trigger
INSERT INTO public.users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  created_at,
  updated_at,
  is_active
)
SELECT 
  au.id,
  au.email,
  'supabase_auth_user',
  COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'User'),
  'student',
  au.created_at,
  au.updated_at,
  true
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = EXCLUDED.updated_at;

-- Grant necessary permissions to the auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Verify the setup
SELECT 
  'Trigger created successfully' as status,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND event_object_table = 'users';

-- Show any users that might still have sync issues
SELECT 
  'Users in auth.users but not in public.users:' as check_type,
  COUNT(*) as count
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL

UNION ALL

SELECT 
  'Users in public.users but not in auth.users:' as check_type,
  COUNT(*) as count
FROM public.users pu
LEFT JOIN auth.users au ON pu.id = au.id
WHERE au.id IS NULL;
