import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
      `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'NOT_SET',
    SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    // Check if the key contains any newlines or special characters
    SUPABASE_SERVICE_ROLE_KEY_HAS_NEWLINES: process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('\n') || false,
    SUPABASE_SERVICE_ROLE_KEY_HAS_CARRIAGE_RETURNS: process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('\r') || false,
  };

  return NextResponse.json({
    message: 'Environment variables debug info',
    envVars,
    timestamp: new Date().toISOString()
  });
}

