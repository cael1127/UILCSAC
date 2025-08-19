# Learning Paths Setup Instructions

## 🚀 Quick Setup for Learning Paths

The learning paths system requires the database tables to be created first. Follow these steps:

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the "SQL Editor" section

### 2. Run the Scripts in Order

**Script 1: Create Tables**
```sql
-- Copy and paste the contents of scripts/006_create_learning_paths.sql
-- This creates all the necessary tables for learning paths
```

**Script 2: Seed Questions**
```sql
-- Copy and paste the contents of scripts/007_seed_learning_questions.sql
-- This adds sample questions to the first 4 modules
```

**Script 3: Set RLS Policies**
```sql
-- Copy and paste the contents of scripts/008_learning_paths_rls_policies.sql
-- This sets up security policies for the tables
```

### 3. Verify Setup

After running the scripts, you should see:
- ✅ `learning_paths` table with 1 learning path
- ✅ `path_modules` table with 8 modules
- ✅ `questions` table with 12 sample questions
- ✅ `question_options` table with multiple choice options
- ✅ RLS policies enabled on all tables

### 4. Test the System

1. Go to your dashboard
2. Click the "Learning Paths" tab
3. Click "Start Learning" on the Java Fundamentals path
4. You should see the learning path overview with 8 modules

## 🔍 Troubleshooting

**If you see "No learning paths available":**
- Check that the SQL scripts ran successfully
- Verify tables exist in Supabase
- Check browser console for errors

**If you get database errors:**
- Make sure you're in the correct Supabase project
- Check that you have the right permissions
- Verify the SQL syntax is correct

## 📋 What Gets Created

- **1 Learning Path**: Java Fundamentals to Advanced Algorithms
- **8 Modules**: From basics to advanced algorithms
- **12 Questions**: Mix of multiple choice and written
- **Progress Tracking**: User progress and scoring system
- **Security**: Row-level security policies

## 🎯 Expected Result

After setup, users can:
- View learning paths on dashboard
- Start structured learning journeys
- Answer questions and track progress
- Navigate through progressive modules
- See completion status and scores
