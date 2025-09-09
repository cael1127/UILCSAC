# Database Setup Guide for UIL CS Academy

This guide will help you set up the Supabase database for your UIL CS Academy project.

## 🚨 **Current Issue**
Your IDE components are trying to connect to database tables that don't exist yet. This is why you're getting connection errors.

## 📋 **Quick Setup (Single File)**

### **Step 1: Access Supabase SQL Editor**
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `mjdkyyvmpwttlpaebnuw`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Run Complete Setup**
1. Copy the **entire contents** of `scripts/complete_database_setup.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the complete script
4. You should see "Success" message at the end

### **Step 3: Verify Setup**
1. Go to **Table Editor** in Supabase
2. You should see these tables:
   - `users`
   - `code_executions`
   - `learning_paths`
   - `path_modules`
   - `questions`
   - `question_options`
   - `user_learning_progress`
   - `user_question_responses`
   - `problems`
   - `test_cases`
   - `user_progress`
   - `submissions`

## 🔄 **Alternative: Step-by-Step Setup**

If you prefer to run the setup in separate steps, you can use the individual files:
- `scripts/001_create_core_tables.sql` - Creates all tables
- `scripts/002_enable_rls_policies.sql` - Sets up security
- `scripts/003_seed_sample_data.sql` - Adds sample data

**Note**: The single file approach (`complete_database_setup.sql`) is recommended as it's faster and ensures everything is set up correctly in the right order.

## 🧪 **Test the Connection**

After setting up the database, test your connection:

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Open your browser and go to: http://localhost:3000/api/test-supabase

3. You should see a success response like:
   ```json
   {
     "success": true,
     "message": "Supabase connection successful",
     "tableAccess": "code_executions table accessible"
   }
   ```

## 🔧 **Troubleshooting**

### **If you get "table does not exist" errors:**
- Make sure you ran all three SQL scripts in order
- Check that the scripts completed successfully
- Verify the tables exist in the Table Editor

### **If you get permission errors:**
- Make sure you ran the RLS policies script
- Check that your service role key is correct in `.env.local`

### **If the IDE still doesn't work:**
- Restart your development server: `pnpm dev`
- Clear your browser cache
- Check the browser console for any remaining errors

## 📊 **What Each Table Does**

- **`code_executions`**: Stores Java code execution history and results
- **`users`**: User profiles and authentication data
- **`learning_paths`**: Learning curriculum structure
- **`path_modules`**: Individual modules within learning paths
- **`questions`**: Questions for each module
- **`question_options`**: Multiple choice options for questions
- **`problems`**: Practice programming problems
- **`test_cases`**: Test inputs and expected outputs for problems
- **`user_progress`**: Tracks user progress through problems
- **`submissions`**: Stores code submissions and results

## 🎯 **Next Steps**

After setting up the database:

1. **Test the IDE**: Try running some Java code in the IDE components
2. **Create a user account**: Sign up through the auth system
3. **Explore learning paths**: Navigate through the learning modules
4. **Try practice problems**: Solve some programming problems

## 🆘 **Need Help?**

If you encounter any issues:

1. Check the Supabase logs in your project dashboard
2. Look at the browser console for error messages
3. Verify your environment variables are correct
4. Make sure all SQL scripts ran successfully

The database setup is the foundation for your entire application, so it's important to get this right!
