"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Play, RotateCcw, CheckCircle, XCircle, Clock, Zap, AlertTriangle, Code, Terminal, Settings, Copy, Download, Maximize2, Minimize2, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Modern VS Code-inspired code editor with syntax highlighting
const ModernCodeEditor = ({ value, onChange, language, height, theme }: {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height: string;
  theme: string;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  
  const lines = value.split('\n');
  const lineCount = lines.length;
  
  return (
    <div className={`relative group ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Modern IDE Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600 rounded-t-lg">
        <div className="flex items-center justify-between px-4 py-3">
          {/* File tabs */}
          <div className="flex items-center space-x-1">
            <div className="bg-slate-700 px-3 py-1.5 rounded-t-md border-b-2 border-blue-400">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-[var(--foreground)]">Solution.java</span>
                <div className="w-2 h-2 rounded-full bg-green-400 ml-2"></div>
              </div>
            </div>
          </div>
          
          {/* IDE Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Code Editor Area */}
      <div className="bg-[var(--muted)] border-x border-[var(--border)]">
        <div className="flex">
          {/* Line numbers */}
          {showLineNumbers && (
            <div className="bg-slate-800 text-slate-400 text-sm py-4 px-3 border-r border-slate-600 select-none font-mono">
              {lines.map((_, index) => (
                <div key={index} className="text-right pr-3 leading-6 h-6 flex items-center justify-end">
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          
          {/* Code textarea */}
          <div className="flex-1 relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full bg-[var(--muted)] text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none leading-6 p-4 border-0"
              placeholder={`// Write your ${language} code here...`}
              style={{ height, minHeight: '400px' }}
              spellCheck={false}
            />
            
            {/* Syntax highlighting overlay (basic) */}
            <div className="absolute inset-0 pointer-events-none p-4">
              <div className="font-mono text-sm leading-6 whitespace-pre-wrap text-transparent">
                {value.split('\n').map((line, lineIndex) => (
                  <div key={lineIndex} className="h-6">
                    {line.split('').map((char, charIndex) => {
                      // Basic syntax highlighting
                      let color = 'text-[var(--foreground)]';
                      if (char === '/' && line[charIndex + 1] === '/') {
                        color = 'text-green-400';
                      } else if (['public', 'class', 'static', 'void', 'main', 'String', 'int', 'double', 'boolean'].includes(line.split(' ').find(word => word.includes(char)) || '')) {
                        color = 'text-blue-400';
                      } else if (['"', "'"].includes(char)) {
                        color = 'text-yellow-400';
                      } else if (['{', '}', '(', ')', '[', ']', ';'].includes(char)) {
                        color = 'text-[var(--muted-foreground)]';
                      }
                      return <span key={charIndex} className={color}>{char}</span>;
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-slate-800 border-x border-b border-slate-600 rounded-b-lg px-4 py-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Java</span>
            <span>UTF-8</span>
            <span>{lineCount} lines</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Ln 1, Col 1</span>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProfessionalJavaIDEProps {
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
  compilationTime?: number;
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
  error?: string;
}

// Predefined Java templates for common problem types (Eclipse-style main class approach)
const JAVA_TEMPLATES = {
  array: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // TODO: Implement your solution here
        // Example: Find two numbers that sum to target
        
        int[] testInput = {2, 7, 11, 15};
        int target = 9;
        
        System.out.println("=== ARRAY PROBLEM ===");
        System.out.println("Input: " + Arrays.toString(testInput));
        System.out.println("Target: " + target);
        
        // Your solution goes here - implement directly in main method
        int[] result = new int[2];
        
        // TODO: Write your algorithm here
        // Example: Find two numbers that sum to target
        for (int i = 0; i < testInput.length; i++) {
            for (int j = i + 1; j < testInput.length; j++) {
                if (testInput[i] + testInput[j] == target) {
                    result[0] = i;
                    result[1] = j;
                    break;
                }
            }
        }
        
        System.out.println("Result: " + Arrays.toString(result));
        System.out.println("Expected: [0, 1] (indices of 2 and 7 that sum to 9)");
    }
}`,
  
  string: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // TODO: Implement your solution here
        // Example: Check if string is palindrome
        
        String testInput = "racecar";
        
        System.out.println("=== STRING PROBLEM ===");
        System.out.println("Input: " + testInput);
        
        // Your solution goes here - implement directly in main method
        boolean result = true;
        
        // TODO: Write your algorithm here
        // Example: Check if string is palindrome
        int left = 0;
        int right = testInput.length() - 1;
        
        while (left < right) {
            if (testInput.charAt(left) != testInput.charAt(right)) {
                result = false;
                break;
            }
            left++;
            right--;
        }
        
        System.out.println("Result: " + result);
        System.out.println("Expected: true (racecar is a palindrome)");
    }
}`,
  
  math: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // TODO: Implement your solution here
        // Example: Calculate factorial
        
        int testInput = 5;
        
        System.out.println("=== MATH PROBLEM ===");
        System.out.println("Input: " + testInput);
        
        // Your solution goes here - implement directly in main method
        int result = 1;
        
        // TODO: Write your algorithm here
        // Example: Calculate factorial
        for (int i = 1; i <= testInput; i++) {
            result *= i;
        }
        
        System.out.println("Result: " + result);
        System.out.println("Expected: 120 (5! = 5 * 4 * 3 * 2 * 1)");
    }
}`,
  
  generic: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        // TODO: Implement your solution here
        // This is a generic template - modify as needed for your problem
        
        System.out.println("=== GENERIC PROBLEM ===");
        System.out.println("Problem: " + "Your problem description here");
        
        // Your solution goes here
        // Implement your algorithm directly in the main method
        // Use System.out.println() to show your results
        
        // TODO: Write your solution here
        String result = "Your solution result here";
        
        System.out.println("Result: " + result);
        System.out.println("Expected: " + "What the expected output should be");
    }
}`
};

export const ProfessionalJavaIDE = React.memo(function ProfessionalJavaIDE({
  questionId,
  userId,
  questionTitle,
  questionDescription,
  templateCode = '',
  expectedSignature = '',
  testCases = [],
  onExecutionComplete
}: ProfessionalJavaIDEProps) {
  // Early return if no question data
  if (!questionId || !userId) {
    return (
      <div className="text-center py-8 text-[var(--muted-foreground)]">
        <p>No question data available</p>
      </div>
    );
  }
  const [code, setCode] = useState(templateCode || JAVA_TEMPLATES.generic);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState('');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);


  // Auto-detect template based on question content and reset when question changes
  useEffect(() => {
    // Reset execution result when question changes
    setExecutionResult(null);
    
    if (!templateCode) {
      const questionText = (questionDescription + ' ' + questionTitle).toLowerCase();
      
      if (questionText.includes('array') || questionText.includes('list') || questionText.includes('numbers')) {
        setCode(JAVA_TEMPLATES.array);
      } else if (questionText.includes('string') || questionText.includes('text') || questionText.includes('character')) {
        setCode(JAVA_TEMPLATES.string);
      } else if (questionText.includes('math') || questionText.includes('calculate') || questionText.includes('sum')) {
        setCode(JAVA_TEMPLATES.math);
      } else {
        setCode(JAVA_TEMPLATES.generic);
      }
    } else {
      setCode(templateCode);
    }
  }, [templateCode, questionDescription, questionTitle, questionId]);



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
          name: 'Professional Java IDE',
          version: '1.0.0',
          timeout: 5000,
          memoryLimit: 50
        }
      });
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
          testCases: input ? [{ input, expected: 'custom' }] : testCases,
          questionId,
          userId,
        }),
      });

      const result: ExecutionResult = await response.json();

      if (response.ok) {
        setExecutionResult(result);
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
            name: 'Professional Java IDE',
            version: '1.0.0',
            timeout: 5000,
            memoryLimit: 50
          }
        });
      }
    } catch (error) {
      setExecutionResult({
        success: false,
        output: '',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0,
        memoryUsage: 0,
        environment: {
          name: 'Professional Java IDE',
          version: '1.0.0',
          timeout: 5000,
          memoryLimit: 50
        }
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const runCustomTest = () => {
    if (customInput.trim()) {
      executeCode(customInput);
    }
  };

  const resetCode = () => {
    const questionText = (questionDescription + ' ' + questionTitle).toLowerCase();
    
    if (questionText.includes('array') || questionText.includes('list') || questionText.includes('numbers')) {
      setCode(JAVA_TEMPLATES.array);
    } else if (questionText.includes('string') || questionText.includes('text') || questionText.includes('character')) {
      setCode(JAVA_TEMPLATES.string);
    } else if (questionText.includes('math') || questionText.includes('calculate') || questionText.includes('sum')) {
      setCode(JAVA_TEMPLATES.math);
    } else {
      setCode(JAVA_TEMPLATES.generic);
    }
  };

  const getConsoleOutput = () => {
    if (!executionResult) return null;

    if (executionResult.success) {
      return (
        <div className="space-y-4">
          {/* Success Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-400">Execution Successful</h4>
                <p className="text-sm text-slate-400">Your code ran without errors</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Clock className="h-3 w-3 mr-1" />
                {executionResult.executionTime}ms
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                <Zap className="h-3 w-3 mr-1" />
                {Math.round(executionResult.memoryUsage)}MB
              </Badge>
            </div>
          </div>
          
          {/* Output Display */}
          {executionResult.output && (
            <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-600">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">Console Output</span>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-mono leading-relaxed">
                  {executionResult.output}
                </pre>
              </div>
            </div>
          )}

          {/* Variables Display */}
          {executionResult.variables && Object.keys(executionResult.variables).length > 0 && (
            <div className="bg-[var(--muted)] border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 border-b border-slate-600">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-[var(--muted-foreground)]">Variables</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(executionResult.variables).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3 text-sm">
                      <span className="text-blue-400 font-mono">{key}</span>
                      <span className="text-slate-400">=</span>
                      <span className="text-yellow-400 font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // Parse error for better display
      const errorInfo = parseJavaError(executionResult.error);
      
      return (
        <div className="space-y-4">
          {/* Error Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-red-400">Execution Failed</h4>
                <p className="text-sm text-slate-400">Your code encountered an error</p>
              </div>
            </div>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <Clock className="h-3 w-3 mr-1" />
              {executionResult.executionTime}ms
            </Badge>
          </div>
          
          {/* Error Details */}
          <div className="bg-[var(--muted)] border border-red-500/30 rounded-lg overflow-hidden">
            <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/30">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Error Details</span>
              </div>
            </div>
            <div className="p-4">
              {errorInfo.lineNumber && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-red-400">Line {errorInfo.lineNumber}:</span>
                    <span className="text-sm text-red-300">{errorInfo.errorType}</span>
                  </div>
                </div>
              )}
              
              <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-mono leading-relaxed">
                {executionResult.error}
              </pre>
            </div>
          </div>
        </div>
      );
    }
  };

  // Helper function to parse Java compilation errors
  const parseJavaError = (error: string) => {
    if (!error) return {};
    
    // Look for line number patterns like "Solution.java:15: error: ..."
    const lineMatch = error.match(/Solution\.java:(\d+):\s*(error|warning|note):\s*(.+)/);
    if (lineMatch) {
      return {
        lineNumber: lineMatch[1],
        errorType: lineMatch[2],
        message: lineMatch[3]
      };
    }
    
    // Look for line number patterns from our validation system
    const lineNumberMatch = error.match(/line\s+(\d+)/i);
    if (lineNumberMatch) {
      return {
        lineNumber: lineNumberMatch[1],
        errorType: 'Syntax Error',
        message: error
      };
    }
    
    // Look for position-based errors
    const positionMatch = error.match(/position\s+(\d+)/i);
    if (positionMatch) {
      return {
        lineNumber: getLineNumberFromPosition(code, parseInt(positionMatch[1])),
        errorType: 'Syntax Error',
        message: error
      };
    }
    
    // Look for brace mismatch errors
    if (error.includes('brace') || error.includes('Braces')) {
      return {
        lineNumber: 'Multiple',
        errorType: 'Brace Mismatch',
        message: error
      };
    }
    
    // Look for missing semicolon errors
    if (error.includes('semicolon') || error.includes('Semicolon')) {
      const semicolonMatch = error.match(/line\s+(\d+)/i);
      if (semicolonMatch) {
        return {
          lineNumber: semicolonMatch[1],
          errorType: 'Missing Semicolon',
          message: error
        };
      }
    }
    
    return {};
  };

  // Helper function to get line number from character position
  const getLineNumberFromPosition = (code: string, position: number): string => {
    const lines = code.split('\n');
    let currentPos = 0;
    
    for (let i = 0; i < lines.length; i++) {
      currentPos += lines[i].length + 1; // +1 for newline
      if (currentPos >= position) {
        return String(i + 1);
      }
    }
    
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Modern IDE Container */}
      <div className="bg-slate-950 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
        {/* IDE Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center space-x-3">
                <Code className="h-5 w-5 text-blue-400" />
                <span className="text-lg font-semibold text-[var(--foreground)]">UIL CS Academy IDE</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                  Runtime Ready
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={resetCode}
                variant="ghost"
                size="sm"
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={() => executeCode()}
                disabled={isExecuting || !code.trim()}
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-[var(--primary-foreground)] shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--foreground)] mr-2"></div>
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
        </div>

        {/* IDE Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Code Editor Section */}
          <div className="bg-[var(--muted)]">
            <div className="border-b border-slate-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Editor</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-400">
                  <span>Java</span>
                  <span>UTF-8</span>
                  <span>Browser Runtime</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <ModernCodeEditor
                value={code}
                onChange={handleCodeChange}
                language="java"
                height="500px"
                theme={editorTheme}
              />
            </div>
          </div>

          {/* Console Section */}
          <div className="bg-slate-800 border-l border-slate-700">
            <div className="border-b border-slate-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)] flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  Console & Output
                </h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-6 h-full">
              {!executionResult ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <Terminal className="h-8 w-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-medium text-[var(--muted-foreground)] mb-2">Ready to Code</h4>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Write your Java solution in the editor and click "Run Code" to see the output here.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      No Java installation required
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      Browser-based execution
                    </Badge>
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      Real-time feedback
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-full">
                  {getConsoleOutput()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* IDE Footer */}
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-6">
              <span>Available Imports: java.util.*, java.io.*, java.math.*</span>
              <span>Runtime: Browser-based Java interpreter</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>UIL CS Academy IDE v1.0</span>
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 });
