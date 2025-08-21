# Fixing the "Foreign Key Constraint" Error

## 🚨 Problem Description

You're getting this error when clicking "Start Learning":
```
Error starting learning path: insert or update on table "user_learning_progress" violates foreign key constraint "user_learning_progress_user_id_fkey"
```

## 🔍 Root Cause

The issue is that your application has **two separate user systems**:

1. **Supabase Auth** (`auth.users`) - Handles login/signup
2. **Custom Users Table** (`public.users`) - Your application's user data

When someone signs up through Supabase Auth, they get an ID in `auth.users`, but there's no corresponding entry in your `public.users` table. The foreign key constraint fails because it's trying to reference a user that doesn't exist in the referenced table.

## 🛠️ Solution Options

### **Option 1: Fix Foreign Keys (Recommended)**

This approach changes your tables to reference `auth.users` directly instead of your custom `users` table.

**Steps:**
1. Go to Supabase SQL Editor
2. Run the script: `scripts/010_alternative_fix.sql`
3. This will update all foreign key constraints to point to `auth.users`

**Pros:**
- ✅ Simpler and more reliable
- ✅ No need to maintain duplicate user data
- ✅ Automatically works with Supabase Auth
- ✅ No triggers or complex logic

**Cons:**
- ❌ You lose your custom `users` table data
- ❌ Need to update any code that references `public.users`

### **Option 2: User Synchronization Triggers**

This approach keeps your custom `users` table but automatically syncs it with Supabase Auth.

**Steps:**
1. Go to Supabase SQL Editor
2. Run the script: `scripts/009_fix_user_sync.sql`
3. This creates triggers that automatically sync users

**Pros:**
- ✅ Keeps your existing user data structure
- ✅ No breaking changes to existing code
- ✅ Maintains custom user fields

**Cons:**
- ❌ More complex setup
- ❌ Potential for sync issues
- ❌ Need to maintain both systems

## 🎯 Recommended Approach: Option 1

I recommend **Option 1** because:
- It's simpler and more reliable
- Supabase Auth already handles all the user management you need
- You can still store additional user data in separate tables if needed
- It's the standard approach for Supabase applications

## 📋 Step-by-Step Fix (Option 1)

### 1. Open Supabase Dashboard
- Go to your Supabase project
- Navigate to "SQL Editor"

### 2. Run the Fix Script
```sql
-- Copy and paste the contents of scripts/010_alternative_fix.sql
-- This will update all foreign key constraints
```

### 3. Verify the Changes
After running the script, you should see:
- ✅ All foreign key constraints now reference `auth.users`
- ✅ No more constraint violation errors
- ✅ Learning paths should work properly

### 4. Test the Fix
1. Go to your dashboard
2. Click "Learning Paths" tab
3. Click "Start Learning" on a path
4. Should work without errors now

## 🔧 Alternative: Quick Manual Fix

If you want to test immediately, you can manually fix just the learning paths table:

```sql
-- Drop the problematic constraint
ALTER TABLE user_learning_progress 
DROP CONSTRAINT IF EXISTS user_learning_progress_user_id_fkey;

-- Add new constraint to auth.users
ALTER TABLE user_learning_progress 
ADD CONSTRAINT user_learning_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

## 🚨 Important Notes

### **Before Running the Scripts:**
- Make sure you have a backup of your database
- Test in a development environment first
- Be aware that this will change your database structure

### **After the Fix:**
- Your existing user data in `public.users` will no longer be referenced
- All new user operations will work with Supabase Auth
- You may need to update any code that references `public.users`

### **If You Need Custom User Data:**
You can still store additional user information by creating a separate table:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  school VARCHAR(255),
  grade_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🆘 Still Having Issues?

If you continue to have problems after running the fix:

1. **Check the console** for any new error messages
2. **Verify the foreign keys** were updated correctly
3. **Check user permissions** in Supabase
4. **Ensure you're logged in** with a valid Supabase Auth session

## 📞 Need Help?

The foreign key constraint error is a common issue when integrating Supabase Auth with custom user tables. The fix above should resolve it completely and make your learning paths system work properly.
