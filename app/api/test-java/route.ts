import { NextRequest, NextResponse } from 'next/server';
import { enhancedJavaRuntime } from '@/lib/enhanced-java-runtime';

export async function GET(request: NextRequest) {
  try {
    // Test with a simple Java program
    const testCode = `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        int number = 42;
        System.out.println("The answer is: " + number);
    }
}`;

    console.log('Testing Java execution with code:', testCode);
    
    const result = await enhancedJavaRuntime.execute(testCode);
    
    return NextResponse.json({
      success: true,
      test: 'Java execution test',
      result: result,
      message: 'Java execution test completed'
    });

  } catch (error) {
    console.error('Java execution test error:', error);
    return NextResponse.json(
      { 
        error: 'Java execution test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Java code is required' },
        { status: 400 }
      );
    }

    console.log('Testing Java execution with provided code:', code);
    
    const result = await enhancedJavaRuntime.execute(code);
    
    return NextResponse.json({
      success: true,
      result: result,
      message: 'Java execution test completed'
    });

  } catch (error) {
    console.error('Java execution test error:', error);
    return NextResponse.json(
      { 
        error: 'Java execution test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
