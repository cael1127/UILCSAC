"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  AlertTriangle, 
  Code, 
  Terminal, 
  Settings, 
  Copy, 
  Download,
  Loader2
} from 'lucide-react';

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
  warnings?: string[];
  backend?: 'piston' | 'edge' | 'stub';
}

interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_sample: boolean;
  points: number;
}

interface UnifiedJavaIDEProps {
  questionId?: string;
  userId?: string;
  questionTitle?: string;
  questionDescription?: string;
  testCases?: TestCase[];
  templateCode?: string;
  onExecutionComplete?: (result: ExecutionResult) => void;
}

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
    public static String arrayToString(int[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public static void main(String[] args) {
        // Test your solution
        int[] testInput = {1, 2, 3, 4, 5};
        int[] result = solve(testInput);
        
        System.out.println("Input: " + arrayToString(testInput));
        System.out.println("Output: " + arrayToString(result));
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
        // Test your solution with enhanced calculation support
        int testInput = 5;
        int result = solve(testInput);
        
        System.out.println("Input: " + testInput);
        System.out.println("Output: " + result);
        
        // Demonstrate enhanced math capabilities
        System.out.println("Enhanced calculations:");
        System.out.println("sqrt(25) = " + Math.sqrt(25));
        System.out.println("pow(2, 3) = " + Math.pow(2, 3));
        System.out.println("Complex: sqrt(3² + 4²) = " + Math.sqrt(Math.pow(3, 2) + Math.pow(4, 2)));
    }
    
    public static int solve(int n) {
        // TODO: Implement your solution
        // Example: Calculate factorial with enhanced arithmetic
        if (n <= 1) return 1;
        return n * solve(n - 1);
    }
}`,

  twoSum: `import java.util.*;

public class Solution {
    public static String arrayToString(int[] arr) {
        if (arr == null) return "null";
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    public static void main(String[] args) {
        // Test your solution
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        
        System.out.println("Input: nums = " + arrayToString(nums) + ", target = " + target);
        System.out.println("Output: " + arrayToString(result));
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

export const UnifiedJavaIDE = React.memo(function UnifiedJavaIDE({
  questionId,
  userId,
  questionTitle,
  questionDescription,
  testCases = [],
  templateCode = '',
  onExecutionComplete
}: UnifiedJavaIDEProps) {
  const [code, setCode] = useState(templateCode || JAVA_TEMPLATES.basic);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [testResults, setTestResults] = useState<any[]>([]);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const INDENT = '  ';

  const setSelection = (start: number, end: number) => {
    const el = editorRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.selectionStart = start;
      el.selectionEnd = end;
    });
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.defaultPrevented) return;
    const el = editorRef.current;
    if (!el) return;
    const isMod = e.ctrlKey || e.metaKey || e.altKey;
    const openToClose: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    const closeToOpen: Record<string, string> = { ')': '(', ']': '[', '}': '{', '"': '"', "'": "'" };

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const hasSel = end > start;
    const before = code.slice(0, start);
    const selected = code.slice(start, end);
    const after = code.slice(end);

    // Auto-pair opening brackets/quotes
    if (!isMod && openToClose[e.key]) {
      e.preventDefault();
      const close = openToClose[e.key];
      if (hasSel) {
        const newCode = before + e.key + selected + close + after;
        setCode(newCode);
        setSelection(start + 1, end + 1);
      } else {
        const newCode = before + e.key + close + after;
        setCode(newCode);
        setSelection(start + 1, start + 1);
      }
      return;
    }

    // Skip over existing closing bracket/quote
    if (!isMod && closeToOpen[e.key]) {
      const nextChar = code[end] || '';
      if (nextChar === e.key && !hasSel) {
        e.preventDefault();
        setSelection(start + 1, start + 1);
        return;
      }
    }

    // Backspace deletes paired closer
    if (e.key === 'Backspace' && !hasSel && start > 0) {
      const prev = code[start - 1];
      const next = code[start] || '';
      if (openToClose[prev] && openToClose[prev] === next) {
        e.preventDefault();
        const newCode = code.slice(0, start - 1) + code.slice(start + 1);
        setCode(newCode);
        setSelection(start - 1, start - 1);
        return;
      }
    }

    // Tab / Shift+Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const selStart = start;
      const selEnd = end;
      const selText = code.slice(selStart, selEnd);
      const lineStart = code.lastIndexOf('\n', selStart - 1) + 1;
      const lineEnd = code.indexOf('\n', selEnd);
      const affectedEnd = lineEnd === -1 ? code.length : lineEnd;

      if (selStart !== selEnd && code.slice(lineStart, affectedEnd).includes('\n')) {
        // Multi-line indent/outdent
        const lines = code.slice(lineStart, affectedEnd).split('\n');
        if (e.shiftKey) {
          let removedTotal = 0;
          const newLines = lines.map(l => {
            if (l.startsWith(INDENT)) {
              removedTotal += INDENT.length;
              return l.slice(INDENT.length);
            }
            return l;
          });
          const newBlock = newLines.join('\n');
          const newCode = code.slice(0, lineStart) + newBlock + code.slice(affectedEnd);
          setCode(newCode);
          setSelection(selStart - Math.min(INDENT.length, removedTotal), selEnd - removedTotal);
        } else {
          const newLines = lines.map(l => INDENT + l);
          const newBlock = newLines.join('\n');
          const newCode = code.slice(0, lineStart) + newBlock + code.slice(affectedEnd);
          setCode(newCode);
          setSelection(selStart + INDENT.length, selEnd + INDENT.length * lines.length);
        }
      } else {
        // Single-line/tab insertion
        if (e.shiftKey) {
          // Outdent current line
          const currentLineStart = code.lastIndexOf('\n', selStart - 1) + 1;
          if (code.slice(currentLineStart).startsWith(INDENT)) {
            const newCode = code.slice(0, currentLineStart) + code.slice(currentLineStart + INDENT.length);
            setCode(newCode);
            setSelection(selStart - INDENT.length, selStart - INDENT.length);
          }
        } else {
          const newCode = before + INDENT + after;
          setCode(newCode);
          setSelection(start + INDENT.length, start + INDENT.length);
        }
      }
      return;
    }

    // Enter for smart indentation and brace handling
    if (e.key === 'Enter') {
      e.preventDefault();
      const prevChar = code[start - 1] || '';
      const nextChar = code[end] || '';
      const lineStart = code.lastIndexOf('\n', start - 1) + 1;
      const currentLine = code.slice(lineStart, start);
      const indentMatch = currentLine.match(/^\s*/);
      const currentIndent = indentMatch ? indentMatch[0] : '';

      if (prevChar === '{' && nextChar === '}') {
        const insert = `\n${currentIndent}${INDENT}\n${currentIndent}`;
        const newCode = before + insert + after;
        setCode(newCode);
        setSelection(start + 1 + currentIndent.length + INDENT.length, start + 1 + currentIndent.length + INDENT.length);
      } else if (prevChar === '{') {
        const insert = `\n${currentIndent}${INDENT}`;
        const newCode = before + insert + after;
        setCode(newCode);
        setSelection(start + 1 + currentIndent.length + INDENT.length, start + 1 + currentIndent.length + INDENT.length);
      } else {
        const insert = `\n${currentIndent}`;
        const newCode = before + insert + after;
        setCode(newCode);
        setSelection(start + 1 + currentIndent.length, start + 1 + currentIndent.length);
      }
      return;
    }
  };

  // Auto-detect template based on question content
  useEffect(() => {
    if (!templateCode) {
      const questionText = (questionDescription + ' ' + questionTitle).toLowerCase();
      
      if (questionText.includes('two sum') || questionText.includes('2sum')) {
        setCode(JAVA_TEMPLATES.twoSum);
        setSelectedTemplate('twoSum');
      } else if (questionText.includes('array') || questionText.includes('list')) {
        setCode(JAVA_TEMPLATES.array);
        setSelectedTemplate('array');
      } else if (questionText.includes('string') || questionText.includes('text')) {
        setCode(JAVA_TEMPLATES.string);
        setSelectedTemplate('string');
      } else if (questionText.includes('math') || questionText.includes('calculate')) {
        setCode(JAVA_TEMPLATES.math);
        setSelectedTemplate('math');
      } else {
        setCode(JAVA_TEMPLATES.basic);
        setSelectedTemplate('basic');
      }
    } else {
      setCode(templateCode);
    }
  }, [templateCode, questionDescription, questionTitle]);

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
        warnings: []
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      console.log('🚀 Executing Java code...', { code, input, questionId, userId });
      
      const supaUrlHeader = (process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') || '') : '')) as string;
      const supaAnonHeader = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '') : '')) as string;

      const response = await fetch('/api/web-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Pass Supabase keys via headers to the API route
          'x-supabase-url': supaUrlHeader,
          'x-supabase-anon-key': supaAnonHeader,
        },
        body: JSON.stringify({
          code,
          language: 'java',
          testCases: input ? [{ input, expected: 'custom' }] : testCases,
          questionId,
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
        setExecutionHistory(prev => [result, ...prev.slice(0, 9)]);
        
        if (onExecutionComplete) {
          onExecutionComplete(result);
        }
      } else {
        setExecutionResult(result);
        const diag = (result as any).diagnostics?.[0];
        const loc = diag?.line ? ` (line ${diag.line}${diag.column ? ", col " + diag.column : ''})` : '';
        setCustomOutput(`Error${loc}: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Execution error:', error);
      const errorResult: ExecutionResult = {
        success: false,
        output: '',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0,
        memoryUsage: 0,
        warnings: []
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
        
        const supaUrlHeader2 = (process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') || '') : '')) as string;
        const supaAnonHeader2 = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '') : '')) as string;

        const response = await fetch('/api/web-execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Pass Supabase keys via headers to the API route
            'x-supabase-url': supaUrlHeader2,
            'x-supabase-anon-key': supaAnonHeader2,
          },
          body: JSON.stringify({
            code,
            language: 'java',
            testCases: [testCase],
            questionId,
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
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Execution Successful</span>
            <Badge variant="outline" className="text-xs border-green-600 text-green-600">
              {executionResult.executionTime}ms
            </Badge>
            <Badge variant="outline" className="text-xs border-green-600 text-green-600">
              {Math.round(executionResult.memoryUsage)}MB
            </Badge>
            {executionResult.backend && (
              <Badge variant="outline" className="text-xs">
                Backend: {executionResult.backend.toUpperCase()}
              </Badge>
            )}
          </div>
          
          {executionResult.output && (
            <div className="bg-success/10 border border-success/20 p-3 rounded-md">
              <h4 className="font-medium text-green-800 mb-2">Console Output:</h4>
              <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                {executionResult.output}
              </pre>
            </div>
          )}

          {executionResult.variables && Object.keys(executionResult.variables).length > 0 && (
            <div className="bg-[var(--muted)] border border-[var(--border)] p-3 rounded-md">
              <h4 className="font-medium text-[var(--foreground)] mb-2">Variables:</h4>
              <pre className="text-sm text-[var(--muted-foreground)]">
                {JSON.stringify(executionResult.variables, null, 2)}
              </pre>
            </div>
          )}

          {executionResult.warnings && executionResult.warnings.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 p-3 rounded-md">
              <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
              <ul className="text-sm text-yellow-700">
                {executionResult.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Execution Failed</span>
            <Badge variant="outline" className="text-xs border-red-600 text-red-600">
              {executionResult.executionTime}ms
            </Badge>
            {executionResult.backend && (
              <Badge variant="outline" className="text-xs">
                Backend: {executionResult.backend.toUpperCase()}
              </Badge>
            )}
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
            <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
            <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {executionResult.error}
            </pre>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-modern">
      {/* Modern Header */}
      <div className="card-modern shadow-modern">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Java IDE</h2>
              <p className="text-sm text-muted-foreground">
                Enhanced runtime with advanced features • {questionTitle || 'Practice Problem'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 rounded-full bg-success/10 px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs font-medium text-success">Ready</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Template Selector removed per request */}

      {/* Modern Editor Area */}
      <Card className="card-modern shadow-modern-lg">
        <CardHeader className="space-modern-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                <Code className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Solution.java</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enhanced Java runtime with advanced features
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
                className="btn-outline"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                onClick={resetCode}
                variant="outline"
                size="sm"
                className="btn-outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={() => executeCode()}
                disabled={isExecuting || !code.trim()}
                className="btn-primary"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="code-editor-modern border rounded-lg overflow-hidden">
              {/* Modern Editor Header */}
              <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-sm font-medium text-foreground ml-3">Solution.java</span>
                </div>
                <Badge className="badge-primary">
                  JAVA
                </Badge>
              </div>
              
              {/* Code editor */}
              <Textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleEditorKeyDown}
                ref={editorRef}
                className="w-full h-96 bg-[var(--muted)] text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-6 p-4 border-0"
                placeholder="Write your Java code here..."
                spellCheck={false}
              />
            </div>
          </div>
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
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
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
                            <div className="text-red-600">Error: {result.error}</div>
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
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
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
