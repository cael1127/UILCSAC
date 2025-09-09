"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, CheckCircle, XCircle, Code, Terminal, Database } from 'lucide-react';

// Simple working code editor
const SimpleCodeEditor = ({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <div className="border rounded-md overflow-hidden">
    <div className="bg-muted px-3 py-2 border-b text-sm font-medium">
      Solution.java
    </div>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-80 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Write your Java code here..."
    />
  </div>
);

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
}

interface CodeExecution {
  id: string;
  code: string;
  success: boolean;
  output: string;
  error?: string;
  execution_time: number;
  memory_usage: number;
  created_at: string;
}

export function SimpleJavaIDE({ 
  questionId, 
  userId, 
  questionTitle, 
  questionDescription 
}: {
  questionId: string;
  userId: string;
  questionTitle: string;
  questionDescription: string;
}) {
  const [code, setCode] = useState(`public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<CodeExecution[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load execution history from Supabase
  useEffect(() => {
    loadExecutionHistory();
  }, []);

  const loadExecutionHistory = async () => {
    try {
      const response = await fetch('/api/code-executions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        setExecutionHistory(data.executions || []);
      }
    } catch (error) {
      console.error('Failed to load execution history:', error);
    }
  };

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setResult(null);

    try {
      console.log('Executing Java code...');
      
      // For now, create a simple execution result
      // In the future, this would call the actual Java runtime
      const mockResult: ExecutionResult = {
        success: true,
        output: "Code execution simulation - replace with actual Java runtime",
        executionTime: 150,
        memoryUsage: 256
      };
      
      console.log('Execution result:', mockResult);
      setResult(mockResult);

      // Prepare execution data for logging
      const executionData = {
        code,
        success: mockResult.success,
        output: mockResult.output,
        error: mockResult.error,
        execution_time: mockResult.executionTime,
        memory_usage: mockResult.memoryUsage,
        language: 'java',
        environment: 'supabase',
        question_id: questionId,
        user_id: userId
      };

      console.log('Logging execution data:', executionData);

      // Log to Supabase
      await logExecutionToSupabase(executionData);

    } catch (error) {
      console.error('Code execution error:', error);
      setResult({
        success: false,
        error: `Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        output: '',
        executionTime: 0,
        memoryUsage: 0
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const logExecutionToSupabase = async (executionData: any) => {
    try {
      console.log('=== START: logExecutionToSupabase ===');
      console.log('Execution data to log:', executionData);
      console.log('Attempting to log execution to Supabase...');
      
      // Testing simple API route...
      console.log('Testing simple API route...');
      const testResponse = await fetch('/api/simple-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log('Simple API test successful:', testData);
      } else {
        console.error('Simple API test failed:', testResponse.status, testResponse.statusText);
      }

      // Now try the actual Supabase route
      console.log('Making request to /api/code-executions...');
      const logResponse = await fetch('/api/code-executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(executionData),
      });

      console.log('Supabase logging response received:', {
        status: logResponse.status,
        statusText: logResponse.statusText,
        ok: logResponse.ok,
        headers: Object.fromEntries(logResponse.headers.entries())
      });

      if (!logResponse.ok) {
        console.log('Response is not OK, processing error...');
        let errorData;
        let responseText = '';
        
        try {
          // Try to get the response as text first
          console.log('Reading response as text...');
          responseText = await logResponse.text();
          console.log('Response text:', responseText);
          
          // Try to parse it as JSON
          try {
            errorData = JSON.parse(responseText);
            console.log('Parsed error data:', errorData);
          } catch (parseError) {
            console.log('Failed to parse as JSON:', parseError);
            errorData = { error: 'Failed to parse error response', rawResponse: responseText };
          }
        } catch (textError) {
          console.log('Failed to read response text:', textError);
          errorData = { error: 'Failed to read response', details: textError };
        }

        console.error('Supabase logging failed - full error details:', {
          status: logResponse.status,
          statusText: logResponse.statusText,
          error: errorData,
          responseText: responseText,
          errorKeys: errorData ? Object.keys(errorData) : 'NO_ERROR_DATA'
        });

        // If errorData is empty or doesn't have useful info, create a better error
        if (!errorData || Object.keys(errorData).length === 0) {
          const httpError = `HTTP ${logResponse.status}: ${logResponse.statusText}`;
          console.log('Throwing HTTP error:', httpError);
          throw new Error(httpError);
        } else {
          const detailedError = `Failed to log execution: ${errorData.error || errorData.details || logResponse.statusText}`;
          console.log('Throwing detailed error:', detailedError);
          throw new Error(detailedError);
        }
      }

      console.log('Response is OK, parsing success data...');
      const successData = await logResponse.json();
      console.log('Successfully logged to Supabase:', successData);
      
      // Reload execution history
      console.log('Reloading execution history...');
      await loadExecutionHistory();
      
      console.log('=== END: logExecutionToSupabase (SUCCESS) ===');
      
    } catch (error) {
      console.error('=== ERROR in logExecutionToSupabase ===');
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', (error as any)?.message);
      console.error('Error stack:', (error as any)?.stack);
      console.error('Full error object:', error);
      console.error('=== END ERROR ===');
      throw error;
    }
  };

  const resetCode = () => {
    setCode(`public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Question Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            {questionTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{questionDescription}</p>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <CardTitle>Code Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleCodeEditor value={code} onChange={setCode} />
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={executeCode} 
              disabled={isExecuting}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isExecuting ? 'Running...' : 'Run Code'}
            </Button>
            <Button 
              onClick={resetCode} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={() => setShowHistory(!showHistory)} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              {showHistory ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Execution Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Error"}
                </Badge>
              </div>
              
              {result.success ? (
                <div>
                  <h4 className="font-medium mb-2">Output:</h4>
                  <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                    {result.output}
                  </pre>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium mb-2">Error:</h4>
                  <pre className="bg-red-50 p-3 rounded-md text-sm text-red-700 overflow-x-auto">
                    {result.error}
                  </pre>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Execution Time:</span> {result.executionTime}ms
                </div>
                <div>
                  <span className="font-medium">Memory Usage:</span> {result.memoryUsage}KB
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execution History */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Execution History (Supabase)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {executionHistory.length === 0 ? (
              <p className="text-muted-foreground">No execution history yet.</p>
            ) : (
              <div className="space-y-3">
                {executionHistory.map((execution) => (
                  <div key={execution.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={execution.success ? "default" : "destructive"}>
                        {execution.success ? "Success" : "Error"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(execution.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="mb-2">
                        <strong>Code:</strong>
                        <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-x-auto">
                          {execution.code}
                        </pre>
                      </div>
                      {execution.success ? (
                        <div>
                          <strong>Output:</strong> {execution.output}
                        </div>
                      ) : (
                        <div>
                          <strong>Error:</strong> {execution.error}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                        <span>Time: {execution.execution_time}ms</span>
                        <span>Memory: {execution.memory_usage}KB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
