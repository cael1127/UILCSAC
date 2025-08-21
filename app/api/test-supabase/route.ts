import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Test basic Supabase connection
    const supabase = createRouteHandlerClient({ cookies })
    
    // Test environment variables
    const envStatus = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing'
    }
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('learning_paths')
      .select('count')
      .limit(1)
    
    // Test auth status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: {
        connected: !testError,
        error: testError?.message || null,
        data: testData
      },
      auth: {
        hasSession: !!session,
        sessionError: sessionError?.message || null,
        userId: session?.user?.id || null
      }
    })
    
  } catch (error) {
    console.error('Supabase test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
