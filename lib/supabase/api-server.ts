import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for API routes using service role key
export function createApiServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Minimal, safe diagnostics without printing secrets
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Supabase API Server] Config:', {
      url: supabaseUrl ? 'SET' : 'MISSING',
      serviceKeyPresent: Boolean(supabaseServiceKey),
    });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for API server client');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Check if Supabase is properly configured for API routes
export function isApiSupabaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
