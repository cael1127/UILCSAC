"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, RotateCcw, CheckCircle, XCircle, Clock, Zap, AlertTriangle } from 'lucide-react';
import CodeEditor from '@/components/code-editor';

interface WebExecutionEditorProps {
  questionId: string;
  userId: string;
  questionTitle: string;
  questionDescription: string;
  templateCode?: string;
  expectedSignature?: string;
  testCases?: any[];
  onExecutionComplete?: (result: any) => void;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error: string;
  executionTime: number;
  memoryUsage: number;
  testResults?: TestResult[];
  variables?: Record<string, any>;
  environment: {
    name: string;
    version: string;
    timeout: number;
    memoryLimit: number;
  };
}

interface TestResult {
  testName: string;
  passed: boolean;
  input: any;
  expected: any;
  actual: any;
  executionTime: number;
}

export function WebExecutionEditor({
  questionId,
  userId,
  questionTitle,
  questionDescription,
  templateCode = '',
  expectedSignature = '',
  testCases = [],
  onExecutionComplete
}: WebExecutionEditorProps) {
  const [code, setCode] = useState(templateCode);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);

  useEffect(() => {
    if (templateCode) {
      setCode(templateCode);
    }
  }, [templateCode]);

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const executeCode = async () => {
    if (!code.trim()) {
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/web-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'java',
          testCases,
          questionId,
          userId,
        }),
      });

      const result: ExecutionResult = await response.json();

      if (response.ok) {
        setExecutionResult(result);
        setExecutionHistory(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 executions
        
        if (onExecutionComplete) {
          onExecutionComplete(result);
        }
      } else {
        setExecutionResult({
          success: false,
          output: '',
          error: result.error || 'Execution failed',
          executionTime: 0,
          memoryUsage: 0,
          environment: {
            name: 'Unknown',
            version: 'Unknown',
            timeout: 10000,
            memoryLimit: 100
          }
        });
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: 'Network error occurred',
        executionTime: 0,
        memoryUsage: 0,
        environment: {
          name: 'Unknown',
          version: 'Unknown',
          timeout: 10000,
          memoryLimit: 100
        }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    setCode(templateCode);
    setExecutionResult(null);
  };

  const loadTemplate = () => {
    setCode(templateCode);
  };

  const getExecutionStatusColor = (success: boolean) => {
    return success ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive';
  };

  const getExecutionStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Question Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Web-Based Java Execution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{questionTitle}</h3>
            <p className="text-[var(--muted-foreground)] text-sm">{questionDescription}</p>
          </div>
          
          {expectedSignature && (
            <div className="bg-info/10 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-800">Expected Function Signature:</p>
              <code className="text-blue-700 font-mono text-sm">{expectedSignature}</code>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Clock className="w-4 h-4" />
            <span>Timeout: 10 seconds</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Memory Limit: 100 MB</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Works on any device (Chromebooks, etc.)</span>
          </div>
        </CardContent>
      </Card>

      {/* Editor and Execution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Code Editor</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadTemplate}
                disabled={isExecuting}
              >
                Load Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCode}
                disabled={isExecuting}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-1" />
                {isExecuting ? 'Executing...' : 'Run Code'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="tests">Test Results</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  language="java"
                  height="400px"
                />
              </div>
            </TabsContent>

            <TabsContent value="output" className="mt-4">
              {executionResult ? (
                <div className="space-y-4">
                  {/* Execution Status */}
                  <Alert className={getExecutionStatusColor(executionResult.success)}>
                    <div className="flex items-center gap-2">
                      {getExecutionStatusIcon(executionResult.success)}
                      <AlertDescription>
                        {executionResult.success ? 'Execution completed successfully' : 'Execution failed'}
                      </AlertDescription>
                    </div>
                  </Alert>

                  {/* Execution Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                                       <div className="bg-[var(--muted)] p-3 rounded-lg">
                     <p className="font-medium text-[var(--foreground)]">Execution Time</p>
                     <p className="text-[var(--muted-foreground)]">{executionResult.executionTime}ms</p>
                   </div>
                   <div className="bg-[var(--muted)] p-3 rounded-lg">
                     <p className="font-medium text-[var(--foreground)]">Memory Usage</p>
                     <p className="text-[var(--muted-foreground)]">{(executionResult.memoryUsage / 1024 / 1024).toFixed(2)} MB</p>
                   </div>
                  </div>

                  {/* Output */}
                  {executionResult.output && (
                    <div className="bg-[var(--muted)] text-[var(--foreground)] p-4 rounded-lg font-mono text-sm overflow-auto max-h-64 border border-[var(--border)]">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">$</span>
                        <span>Program Output:</span>
                      </div>
                      <pre className="whitespace-pre-wrap">{executionResult.output}</pre>
                    </div>
                  )}

                                     {/* Variables State (for debugging) */}
                   {executionResult.success && (
                     <div className="bg-[var(--muted)] p-3 rounded-lg">
                       <p className="font-medium text-[var(--foreground)] mb-2">Variables State:</p>
                       <div className="text-xs text-[var(--muted-foreground)] font-mono">
                        {executionResult.variables ? (
                          Object.entries(executionResult.variables).map(([name, value]) => (
                            <div key={name} className="flex gap-2">
                                                         <span className="text-[var(--primary)]">{name}</span>
                           <span>=</span>
                           <span className="text-[var(--success)]">{String(value)}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-[var(--muted-foreground)]">No variables declared</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {executionResult.error && (
                    <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-800">Error:</span>
                      </div>
                      <p className="text-red-700 text-sm">{executionResult.error}</p>
                    </div>
                  )}

                                     {/* Environment Info */}
                   <div className="bg-[var(--info)]/10 p-3 rounded-lg text-sm">
                     <p className="text-[var(--info-foreground)]">
                       <strong>Environment:</strong> {executionResult.environment.name} v{executionResult.environment.version}
                     </p>
                     <p className="text-[var(--info-foreground)]">
                       <strong>Limits:</strong> {executionResult.environment.timeout}ms timeout, {executionResult.environment.memoryLimit}MB memory
                     </p>
                   </div>
                </div>
              ) : (
                <div className="text-center text-[var(--muted-foreground)] py-8">
                  <Play className="w-12 h-12 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p>Click "Run Code" to execute your Java code</p>
                  <p className="text-sm">No Java installation required - runs in your browser!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="tests" className="mt-4">
              {executionResult?.testResults && executionResult.testResults.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Test Results</h4>
                  {executionResult.testResults.map((test, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        test.passed ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{test.testName}</h5>
                        <Badge variant={test.passed ? 'default' : 'destructive'}>
                          {test.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">Input:</p>
                          <code className="text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
                            {JSON.stringify(test.input)}
                          </code>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">Expected:</p>
                          <code className="text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
                            {JSON.stringify(test.expected)}
                          </code>
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">Actual:</p>
                          <code className="text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-1 rounded">
                            {JSON.stringify(test.actual)}
                          </code>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                        Execution time: {test.executionTime}ms
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[var(--muted-foreground)] py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-[var(--muted-foreground)]" />
                  <p>No test results available</p>
                  <p className="text-sm">Run your code to see test results</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {executionHistory.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.success ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getExecutionStatusIcon(result.success)}
                    <div>
                      <p className="font-medium text-sm">
                        Execution #{executionHistory.length - index}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {result.executionTime}ms • {(result.memoryUsage / 1024 / 1024).toFixed(2)}MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExecutionResult(result)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Add default export
export default WebExecutionEditor;

