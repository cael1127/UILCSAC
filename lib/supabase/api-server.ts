import { createClient } from '@supabase/supabase-js';

// Create a Supabase client for API routes using service role key
export function createApiServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('=== API Server Client Debug ===');
  console.log('URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('Service Key Length:', supabaseServiceKey?.length || 0);
  console.log('Service Key First 20 chars:', supabaseServiceKey?.substring(0, 20) || 'N/A');
  console.log('Service Key Last 20 chars:', supabaseServiceKey?.substring(-20) || 'N/A');
  console.log('Service Key contains newlines:', supabaseServiceKey?.includes('\n') || false);
  console.log('Service Key contains carriage returns:', supabaseServiceKey?.includes('\r') || false);
  console.log('=== End Debug ===');

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
