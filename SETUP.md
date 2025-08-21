# UIL CS Academy Setup Guide

## Environment Variables Configuration

### 1. Create Environment File
Create a `.env.local` file in the root directory of your project:

```bash
# Copy the example file
cp env.example .env.local
```

### 2. Configure Supabase Variables
Edit `.env.local` and replace the placeholder values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Development Configuration (optional)
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### 3. Get Your Supabase Credentials

1. Go to [Supabase](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

### 4. Database Setup
Run the SQL scripts in your Supabase SQL Editor in this order:

1. `scripts/006_create_learning_paths.sql` - Create tables
2. `scripts/007_seed_learning_questions.sql` - Add content
3. `scripts/008_learning_paths_rls_policies.sql` - Set permissions

### 5. Start Development Server
```bash
pnpm install
pnpm dev
```

## Important Notes

- **Never commit `.env.local` to version control**
- The `.env.local` file is already in `.gitignore`
- Restart your development server after changing environment variables
- Make sure all Supabase tables are created before testing

## Troubleshooting

### "No learning paths available" Error
- Ensure database scripts have been run
- Check that RLS policies are properly configured
- Verify environment variables are set correctly

### Authentication Errors
- Confirm Supabase URL and keys are correct
- Check that Supabase project is active
- Ensure email confirmation is enabled if required

### Component Import Errors
- Run `pnpm install` to ensure all dependencies are installed
- Check that all components are properly exported
- Clear `.next` folder and restart development server
