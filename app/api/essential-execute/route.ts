import { NextRequest, NextResponse } from 'next/server';
import { essentialJavaRuntime } from '@/lib/essential-java-runtime';

// Essential Java execution function for managed devices
async function executeEssentialJavaCode(code: string): Promise<{
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
  managedDeviceInfo?: any;
}> {
  try {
    // Use the essential Java runtime
    const result = await essentialJavaRuntime.execute(code);
    
    return {
      success: result.success,
      output: result.output,
      error: result.error || '',
      executionTime: result.executionTime,
      memoryUsage: result.memoryUsage,
      variables: result.variables || {},
      managedDeviceInfo: essentialJavaRuntime.getManagedDeviceInfo()
    };
    
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: `Essential Java execution failed: ${error.message || 'Unknown error'}`,
      executionTime: 0,
      memoryUsage: 0,
      variables: {},
      managedDeviceInfo: essentialJavaRuntime.getManagedDeviceInfo()
    };
  }
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

    // Execute the code using essential Java runtime
    let executionResult;
    if (language === 'java') {
      try {
        executionResult = await executeEssentialJavaCode(code);
      } catch (javaError: any) {
        // Handle Java runtime errors
        executionResult = {
          success: false,
          output: '',
          error: `Essential Java execution failed: ${javaError.message || 'Unknown error'}`,
          executionTime: 0,
          memoryUsage: 0,
          variables: {},
          managedDeviceInfo: essentialJavaRuntime.getManagedDeviceInfo()
        };
      }
    } else {
      // For other languages, you'd implement similar interpreters
      executionResult = {
        success: false,
        output: '',
        error: `Language ${language} not yet supported in essential runtime`,
        executionTime: 0,
        memoryUsage: 0,
        variables: {},
        managedDeviceInfo: essentialJavaRuntime.getManagedDeviceInfo()
      };
    }

    // Return the execution result with managed device information
    return NextResponse.json({
      success: executionResult.success,
      output: executionResult.output,
      error: executionResult.error,
      executionTime: executionResult.executionTime,
      memoryUsage: executionResult.memoryUsage,
      variables: executionResult.variables || {},
      managedDeviceInfo: executionResult.managedDeviceInfo,
      environment: {
        name: 'Essential Java Runtime for Managed Devices',
        version: '1.0.0',
        timeout: 10000,
        memoryLimit: 50,
        managedDeviceSafe: true,
        chromebookCompatible: true
      }
    });

  } catch (error) {
    console.error('Essential execution error:', error);
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
          id: 'essential-java-1',
          name: 'Essential Java Runtime for Managed Devices',
          language: 'java',
          version: '1.0.0',
          is_active: true,
          description: 'Minimal Java runtime for Chromebooks and managed devices',
          managedDeviceSafe: true,
          chromebookCompatible: true,
          features: essentialJavaRuntime.getManagedDeviceInfo().features,
          limitations: essentialJavaRuntime.getManagedDeviceInfo().limitations
        }
      ],
      supportedLanguages: ['java'],
      systemInfo: {
        javaAvailable: true,
        javaVersion: 'Essential Runtime',
        runtime: 'Browser-based (no system Java required)',
        managedDeviceSafe: true,
        chromebookCompatible: true
      },
      managedDeviceInfo: essentialJavaRuntime.getManagedDeviceInfo()
    });

  } catch (error) {
    console.error('Error fetching essential execution environments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


