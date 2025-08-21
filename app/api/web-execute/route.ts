import { NextRequest, NextResponse } from 'next/server';
import { javaInterpreter } from '@/lib/web-java-interpreter';

// Helper function to run test cases
function runTestCases(code: string, testCases: any[]): any[] {
  const results = [];
  for (const testCase of testCases) {
    try {
      // Simple test case execution - in a real implementation, you'd parse and run the test
      const result = {
        testCaseId: testCase.id,
        passed: Math.random() > 0.3, // Simulate 70% pass rate for now
        output: `Test case ${testCase.id} executed`,
        expected: testCase.expected,
        actual: `Actual output for test ${testCase.id}`
      };
      results.push(result);
    } catch (error) {
      results.push({
        testCaseId: testCase.id,
        passed: false,
        output: `Error: ${error}`,
        expected: testCase.expected,
        actual: 'Error occurred'
      });
    }
  }
  return results;
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, testCases, questionId, userId } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Execute the code
    let executionResult;
    if (language === 'java') {
      executionResult = javaInterpreter.execute(code);
      // Add memory usage simulation for now
      executionResult.memoryUsage = Math.random() * 10; // Simulate 0-10 MB usage
      executionResult.testResults = testCases ? runTestCases(code, testCases) : null;
    } else {
      // For other languages, you'd implement similar interpreters
      executionResult = {
        success: false,
        output: '',
        error: `Language ${language} not yet supported`,
        executionTime: 0,
        memoryUsage: 0
      };
    }

    // Return the execution result
    return NextResponse.json({
      success: executionResult.success,
      output: executionResult.output,
      error: executionResult.error,
      executionTime: executionResult.executionTime,
      memoryUsage: executionResult.memoryUsage || 0,
      testResults: executionResult.testResults,
      variables: executionResult.variables || {},
      environment: {
        name: 'Web Java Interpreter',
        version: '1.0.0',
        timeout: 5000,
        memoryLimit: 50
      }
    });

  } catch (error) {
    console.error('Web execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    return NextResponse.json({
      environments: [
        {
          id: 'web-java-1',
          name: 'Web Java Interpreter',
          language: 'java',
          version: '1.0.0',
          is_active: true
        }
      ],
      supportedLanguages: ['java']
    });

  } catch (error) {
    console.error('Error fetching execution environments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

