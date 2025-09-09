"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, RotateCcw, CheckCircle, XCircle, Clock, Zap, AlertTriangle, Code, Terminal, Settings, Copy, Download, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
  environment: {
    name: string;
    version: string;
    timeout: number;
    memoryLimit: number;
  };
}

interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_sample: boolean;
  points: number;
}

interface EnhancedJavaIDEProps {
  problemId: string;
  userId: string;
  problemTitle: string;
  problemDescription: string;
  testCases?: TestCase[];
  templateCode?: string;
  onExecutionComplete?: (result: ExecutionResult) => void;
}

// Enhanced Monaco-style code editor
const EnhancedCodeEditor = ({ value, onChange, language, height, theme }: {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height: string;
  theme: string;
}) => (
  <div className="relative">
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* VS Code-style toolbar */}
      <div className="bg-gradient-to-r from-[var(--muted)] to-[var(--muted)]/90 px-3 py-2 border-b border-[var(--border)] flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[var(--destructive)] shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-[var(--warning)] shadow-sm"></div>
        <div className="w-3 h-3 rounded-full bg-[var(--success)] shadow-sm"></div>
        <span className="text-xs text-[var(--muted-foreground)] ml-2 font-medium">Solution.java</span>
        <Badge variant="outline" className="text-xs border-[var(--primary)] text-[var(--primary)] ml-auto">
          {language.toUpperCase()}
        </Badge>
      </div>
      
      {/* Line numbers and code area */}
      <div className="flex">
        {/* Line numbers */}
        <div className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs py-3 px-2 border-r border-[var(--border)] select-none">
          {value.split('\n').map((_: string, index: number) => (
            <div key={index} className="text-right pr-2 leading-6">
              {index + 1}
            </div>
          ))}
        </div>
        
        {/* Code textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-3 bg-[var(--input)] text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] leading-6 transition-colors"
          placeholder={`Write your ${language} code here...`}
          style={{ height, minHeight: '400px' }}
          spellCheck={false}
        />
      </div>
    </div>
  </div>
);

// Java templates for different problem types
const JAVA_TEMPLATES = {
  basic: `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Your solution here
        int result = solve();
        System.out.println("Result: " + result);
    }
    
    public static int solve() {
        // TODO: Implement your solution
        return 0;
    }
}`,

  array: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Test your solution
        int[] testInput = {1, 2, 3, 4, 5};
        int[] result = solve(testInput);
        
        System.out.println("Input: " + Arrays.toString(testInput));
        System.out.println("Output: " + Arrays.toString(result));
    }
    
    public static int[] solve(int[] nums) {
        // TODO: Implement your solution
        // Example: Return the array doubled
        int[] result = new int[nums.length];
        for (int i = 0; i < nums.length; i++) {
            result[i] = nums[i] * 2;
        }
        return result;
    }
}`,

  string: `public class Solution {
    public static void main(String[] args) {
        // Test your solution
        String testInput = "hello";
        String result = solve(testInput);
        
        System.out.println("Input: " + testInput);
        System.out.println("Output: " + result);
    }
    
    public static String solve(String s) {
        // TODO: Implement your solution
        // Example: Reverse the string
        return new StringBuilder(s).reverse().toString();
    }
}`,

  math: `public class Solution {
    public static void main(String[] args) {
        // Test your solution
        int testInput = 5;
        int result = solve(testInput);
        
        System.out.println("Input: " + testInput);
        System.out.println("Output: " + result);
    }
    
    public static int solve(int n) {
        // TODO: Implement your solution
        // Example: Calculate factorial
        if (n <= 1) return 1;
        return n * solve(n - 1);
    }
}`,

  twoSum: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        // Test your solution
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        
        System.out.println("Input: nums = " + Arrays.toString(nums) + ", target = " + target);
        System.out.println("Output: " + Arrays.toString(result));
    }
    
    public static int[] twoSum(int[] nums, int target) {
        // TODO: Implement two sum algorithm
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`
};

export const EnhancedJavaIDE = React.memo(function EnhancedJavaIDE({
  problemId,
  userId,
  problemTitle,
  problemDescription,
  testCases = [],
  templateCode = '',
  onExecutionComplete
}: EnhancedJavaIDEProps) {
  const [code, setCode] = useState(templateCode || JAVA_TEMPLATES.basic);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [testResults, setTestResults] = useState<any[]>([]);

  // Auto-detect template based on problem content
  useEffect(() => {
    if (!templateCode) {
      const problemText = (problemDescription + ' ' + problemTitle).toLowerCase();
      
      if (problemText.includes('two sum') || problemText.includes('2sum')) {
        setCode(JAVA_TEMPLATES.twoSum);
        setSelectedTemplate('twoSum');
      } else if (problemText.includes('array') || problemText.includes('list')) {
        setCode(JAVA_TEMPLATES.array);
        setSelectedTemplate('array');
      } else if (problemText.includes('string') || problemText.includes('text')) {
        setCode(JAVA_TEMPLATES.string);
        setSelectedTemplate('string');
      } else if (problemText.includes('math') || problemText.includes('calculate')) {
        setCode(JAVA_TEMPLATES.math);
        setSelectedTemplate('math');
      } else {
        setCode(JAVA_TEMPLATES.basic);
        setSelectedTemplate('basic');
      }
    } else {
      setCode(templateCode);
    }
  }, [templateCode, problemDescription, problemTitle]);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const executeCode = async (input?: string) => {
    if (!code.trim()) {
      setExecutionResult({
        success: false,
        output: '',
        error: 'No code to execute',
        executionTime: 0,
        memoryUsage: 0,
        environment: {
          name: 'Enhanced Java Runtime',
          version: '1.0.0',
          timeout: 10000,
          memoryLimit: 50
        }
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      console.log('🚀 Executing Java code...', { code, input, problemId, userId });
      
      const response = await fetch('/api/web-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'java',
          testCases: input ? [{ input, expected: 'custom' }] : testCases,
          questionId: problemId,
          userId,
        }),
      });

      console.log('📡 API Response:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ExecutionResult = await response.json();
      console.log('✅ Execution result:', result);

      if (result.success) {
        setExecutionResult(result);
        setCustomOutput(result.output);
        
        // Add to execution history
        setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 executions
        
        if (onExecutionComplete) {
          onExecutionComplete(result);
        }
      } else {
        setExecutionResult(result);
        setCustomOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Execution error:', error);
      const errorResult: ExecutionResult = {
        success: false,
        output: '',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0,
        memoryUsage: 0,
        environment: {
          name: 'Enhanced Java Runtime',
          version: '1.0.0',
          timeout: 10000,
          memoryLimit: 50
        }
      };
      setExecutionResult(errorResult);
      setCustomOutput(`Error: ${errorResult.error}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const runCustomTest = () => {
    if (customInput.trim()) {
      executeCode(customInput);
    }
  };

  const runSampleTests = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setTestResults([]);

    try {
      const sampleTests = testCases.filter(tc => tc.is_sample);
      const results = [];

      for (const testCase of sampleTests) {
        console.log('🧪 Running test case:', testCase);
        
        const response = await fetch('/api/web-execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language: 'java',
            testCases: [testCase],
            questionId: problemId,
            userId,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            ...testCase,
            passed: result.success && result.output.trim() === testCase.expected_output.trim(),
            actual: result.output,
            executionTime: result.executionTime,
            memoryUsed: result.memoryUsage,
            error: result.error
          });
        }
      }

      setTestResults(results);
    } catch (error) {
      console.error('Error running sample tests:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    setCode(JAVA_TEMPLATES[selectedTemplate as keyof typeof JAVA_TEMPLATES]);
    setExecutionResult(null);
    setCustomOutput('');
    setTestResults([]);
  };

  const changeTemplate = (template: string) => {
    setSelectedTemplate(template);
    setCode(JAVA_TEMPLATES[template as keyof typeof JAVA_TEMPLATES]);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Solution.java';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getConsoleOutput = () => {
    if (!executionResult) return null;

    if (executionResult.success) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--success)]">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Execution Successful</span>
            <Badge variant="outline" className="text-xs border-[var(--success)] text-[var(--success)]">
              {executionResult.executionTime}ms
            </Badge>
            <Badge variant="outline" className="text-xs border-[var(--success)] text-[var(--success)]">
              {Math.round(executionResult.memoryUsage)}MB
            </Badge>
          </div>
          
          {executionResult.output && (
            <div className="bg-[var(--success)]/10 border border-[var(--success)]/20 p-3 rounded-md">
              <h4 className="font-medium text-[var(--success)] mb-2">Console Output:</h4>
              <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                {executionResult.output}
              </pre>
            </div>
          )}

          {executionResult.variables && Object.keys(executionResult.variables).length > 0 && (
            <div className="bg-[var(--muted)]/50 border border-[var(--border)] p-3 rounded-md">
              <h4 className="font-medium text-[var(--foreground)] mb-2">Variables:</h4>
              <pre className="text-sm text-[var(--muted-foreground)]">
                {JSON.stringify(executionResult.variables, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--destructive)]">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Execution Failed</span>
            <Badge variant="outline" className="text-xs border-[var(--destructive)] text-[var(--destructive)]">
              {executionResult.executionTime}ms
            </Badge>
          </div>
          
          <div className="bg-[var(--destructive)]/10 border border-[var(--destructive)]/20 p-3 rounded-md">
            <h4 className="font-medium text-[var(--destructive)] mb-2">Error Details:</h4>
            <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {executionResult.error}
            </pre>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced header */}
      <div className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-t-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-[var(--primary)]" />
          <span className="font-medium text-[var(--foreground)]">Enhanced Java IDE</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)]"></div>
            <span className="text-xs text-[var(--muted-foreground)]">Supabase Connected</span>
          </div>
        </div>
        <div className="text-sm text-[var(--muted-foreground)] mt-1">
          Real Java execution with console output • {problemTitle}
        </div>
      </div>
      
      {/* Template selector */}
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
        <CardHeader className="pb-3 bg-[var(--muted)] border-b border-[var(--border)]">
          <CardTitle className="text-lg text-[var(--foreground)] flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Code Templates & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {Object.entries(JAVA_TEMPLATES).map(([key, template]) => (
              <Button
                key={key}
                variant={selectedTemplate === key ? "default" : "outline"}
                size="sm"
                onClick={() => changeTemplate(key)}
                className="text-xs"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={editorTheme} onValueChange={setEditorTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">Dark</SelectItem>
                <SelectItem value="vs-light">Light</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12px</SelectItem>
                <SelectItem value="14">14px</SelectItem>
                <SelectItem value="16">16px</SelectItem>
                <SelectItem value="18">18px</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main editor area */}
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 bg-[var(--muted)] border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-[var(--foreground)]">Solution.java</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
              <Button
                onClick={downloadCode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={resetCode}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={() => executeCode()}
                disabled={isExecuting || !code.trim()}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
              >
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            <strong>Real Java Execution:</strong> Your code runs on Supabase backend with actual console output
            <br />
            <strong>Features:</strong> Syntax highlighting, error detection, variable tracking, performance metrics
          </div>
        </CardHeader>
        <CardContent>
          <EnhancedCodeEditor
            value={code}
            onChange={handleCodeChange}
            language="java"
            height="400px"
            theme={editorTheme}
          />
        </CardContent>
      </Card>

      {/* Console and Testing Section */}
      <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
        <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)]">
          <CardTitle className="text-lg text-[var(--foreground)] flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Console Output & Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="console" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="console">Console Output</TabsTrigger>
              <TabsTrigger value="custom">Custom Test</TabsTrigger>
              <TabsTrigger value="samples">Sample Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="console" className="space-y-4">
              {!executionResult ? (
                <div className="text-center py-6 text-[var(--muted-foreground)]">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No code executed yet. Run your code to see results here.</p>
                </div>
              ) : (
                getConsoleOutput()
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Custom Input</label>
                <Textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter your test input..."
                  className="min-h-[80px] font-mono text-sm"
                />
              </div>
              <Button onClick={runCustomTest} disabled={isExecuting || !code.trim()}>
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Running...' : 'Run Custom Test'}
              </Button>
              {customOutput && (
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Output</label>
                  <pre className="bg-[var(--muted)] p-3 rounded text-sm overflow-x-auto max-h-40">
                    {customOutput}
                  </pre>
                </div>
              )}
            </TabsContent>

            <TabsContent value="samples" className="space-y-4">
              <Button onClick={runSampleTests} disabled={isExecuting || !code.trim()}>
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Running...' : 'Run Sample Tests'}
              </Button>
              {testResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="border border-[var(--border)] rounded p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {result.passed ? (
                          <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                        ) : (
                          <XCircle className="h-4 w-4 text-[var(--destructive)]" />
                        )}
                        <span className="text-sm font-medium">
                          Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                        </span>
                        <div className="ml-auto text-xs text-[var(--muted-foreground)]">
                          {result.executionTime}ms, {Math.round(result.memoryUsed / 1024)}KB
                        </div>
                      </div>
                      {!result.passed && (
                        <div className="text-xs space-y-1">
                          {result.error ? (
                            <div className="text-[var(--destructive)]">Error: {result.error}</div>
                          ) : (
                            <>
                              <div>
                                <strong>Expected:</strong> {result.expected_output}
                              </div>
                              <div>
                                <strong>Got:</strong> {result.actual}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-sm">
          <CardHeader className="bg-[var(--muted)] border-b border-[var(--border)]">
            <CardTitle className="text-lg text-[var(--foreground)] flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Execution History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {executionHistory.map((execution, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border border-[var(--border)] rounded">
                  {execution.success ? (
                    <CheckCircle className="h-4 w-4 text-[var(--success)]" />
                  ) : (
                    <XCircle className="h-4 w-4 text-[var(--destructive)]" />
                  )}
                  <span className="text-sm">
                    {execution.success ? 'Success' : 'Failed'} • {execution.executionTime}ms
                  </span>
                  <div className="ml-auto text-xs text-[var(--muted-foreground)]">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
