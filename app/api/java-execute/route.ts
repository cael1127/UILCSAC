import { NextRequest, NextResponse } from 'next/server';
import { enhancedJavaRuntime } from '@/lib/enhanced-java-runtime';

export async function POST(request: NextRequest) {
  try {
    const { code, userId, questionId } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Java code is required' },
        { status: 400 }
      );
    }

    console.log('=== ENHANCED JAVA EXECUTION ===');
    console.log('Received Java code:', code);
    console.log('User ID:', userId);
    console.log('Question ID:', questionId);

    // Execute the Java code using the enhanced Java runtime
    const executionResult = await enhancedJavaRuntime.execute(code);

    console.log('Execution completed:', executionResult);

    return NextResponse.json({
      success: true,
      result: executionResult,
      message: 'Java code executed successfully with enhanced runtime'
    });

  } catch (error) {
    console.error('Enhanced Java execution error:', error);
    return NextResponse.json(
      { 
        error: 'Java execution failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}


