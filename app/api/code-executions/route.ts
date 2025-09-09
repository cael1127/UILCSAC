import { NextRequest, NextResponse } from 'next/server';
import { createApiServerClient, isApiSupabaseConfigured } from '@/lib/supabase/api-server';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isApiSupabaseConfigured()) {
      console.error('Missing Supabase environment variables for API server');
      return NextResponse.json(
        { 
          error: 'Supabase not configured. Check environment variables.',
          details: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
            key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
          }
        },
        { status: 500 }
      );
    }

    // Create the API server client
    const supabase = createApiServerClient();

    const {
      code,
      success,
      output,
      error,
      execution_time,
      memory_usage,
      language,
      environment,
      question_id,
      user_id
    } = await request.json();

    // Validate required fields
    if (!code || typeof success !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: code and success' },
        { status: 400 }
      );
    }

    // Prepare insert data - only include user_id if it's provided
    const insertData: any = {
      question_id: question_id || null,
      code,
      success,
      output: output || null,
      error: error || null,
      execution_time: execution_time || 0,
      memory_usage: memory_usage || 0,
      language: language || 'java',
      environment: environment || 'supabase'
    };

    // Only add user_id if it's provided and valid
    if (user_id && user_id !== '00000000-0000-0000-0000-000000000000') {
      insertData.user_id = user_id;
    }

    console.log('Attempting to insert into Supabase:', {
      user_id: user_id || 'NOT_PROVIDED',
      question_id,
      code_length: code.length,
      success,
      language
    });

    // Insert into code_executions table
    const { data, error: insertError } = await supabase
      .from('code_executions')
      .insert(insertData)
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to log execution to database',
          details: insertError.message,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    console.log('Successfully logged execution:', data.id);

    return NextResponse.json({
      success: true,
      execution_id: data.id,
      message: 'Code execution logged successfully'
    });

  } catch (error) {
    console.error('Code execution logging error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is properly configured
    if (!isApiSupabaseConfigured()) {
      console.error('Missing Supabase environment variables for API server');
      return NextResponse.json(
        { 
          error: 'Supabase not configured. Check environment variables.',
          details: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
            key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'
          }
        },
        { status: 500 }
      );
    }

    // Create the API server client
    const supabase = createApiServerClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const questionId = searchParams.get('question_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Fetching executions with params:', { userId, questionId, limit });

    // Build query
    let query = supabase
      .from('code_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add filters if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (questionId) {
      query = query.eq('question_id', questionId);
    }

    const { data: executions, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch executions',
          details: error.message,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log(`Successfully fetched ${executions?.length || 0} executions`);

    return NextResponse.json({
      success: true,
      executions: executions || [],
      count: executions?.length || 0
    });

  } catch (error) {
    console.error('Code executions fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
