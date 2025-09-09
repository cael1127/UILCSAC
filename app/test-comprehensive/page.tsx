"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Calculator,
  Code,
  Terminal,
  Zap,
  Loader2,
  TestTube,
  Database,
  BarChart3
} from 'lucide-react';

interface TestResult {
  name: string;
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  expected?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
}

const COMPREHENSIVE_TESTS = {
  // Mathematical Tests
  operatorPrecedence: {
    name: "Operator Precedence",
    code: `public class OperatorPrecedence {
    public static void main(String[] args) {
        System.out.println("=== Operator Precedence Tests ===");
        
        int a = 10, b = 5, c = 2;
        
        // Test 1: Multiplication before addition
        int result1 = a + b * c;
        System.out.println("a + b * c = " + a + " + " + b + " * " + c + " = " + result1);
        
        // Test 2: Division before subtraction
        int result2 = a - b / c;
        System.out.println("a - b / c = " + a + " - " + b + " / " + c + " = " + result2);
        
        // Test 3: Multiple operations
        int result3 = a * b + c * 2;
        System.out.println("a * b + c * 2 = " + a + " * " + b + " + " + c + " * 2 = " + result3);
        
        // Test 4: Modulo operation
        int result4 = a % b + c;
        System.out.println("a % b + c = " + a + " % " + b + " + " + c + " = " + result4);
    }
}`,
    expected: "a + b * c = 10 + 5 * 2 = 20"
  },

  parentheses: {
    name: "Parentheses Support",
    code: `public class Parentheses {
    public static void main(String[] args) {
        System.out.println("=== Parentheses Tests ===");
        
        int a = 10, b = 5, c = 2;
        
        // Test 1: Simple parentheses
        int result1 = (a + b) * c;
        System.out.println("(a + b) * c = (" + a + " + " + b + ") * " + c + " = " + result1);
        
        // Test 2: Nested parentheses
        int result2 = ((a + b) * c) / 2;
        System.out.println("((a + b) * c) / 2 = ((" + a + " + " + b + ") * " + c + ") / 2 = " + result2);
        
        // Test 3: Complex nested expression
        int result3 = (a * (b + c)) - (c * (a - b));
        System.out.println("(a * (b + c)) - (c * (a - b)) = " + result3);
        
        // Test 4: Multiple levels
        int result4 = (((a + b) * c) + (a - b)) / c;
        System.out.println("(((a + b) * c) + (a - b)) / c = " + result4);
    }
}`,
    expected: "(a + b) * c = (10 + 5) * 2 = 30"
  },

  mathFunctions: {
    name: "Math Functions",
    code: `public class MathFunctions {
    public static void main(String[] args) {
        System.out.println("=== Math Functions Tests ===");
        
        // Test 1: Square root
        double x = 16.0;
        System.out.println("sqrt(" + x + ") = " + Math.sqrt(x));
        
        // Test 2: Power
        System.out.println("pow(2, 3) = " + Math.pow(2, 3));
        System.out.println("pow(3, 2) = " + Math.pow(3, 2));
        
        // Test 3: Absolute value
        System.out.println("abs(-15.5) = " + Math.abs(-15.5));
        System.out.println("abs(15.5) = " + Math.abs(15.5));
        
        // Test 4: Min/Max
        System.out.println("max(10, 5) = " + Math.max(10, 5));
        System.out.println("min(10, 5) = " + Math.min(10, 5));
        
        // Test 5: Rounding
        System.out.println("round(3.7) = " + Math.round(3.7));
        System.out.println("floor(3.7) = " + Math.floor(3.7));
        System.out.println("ceil(3.7) = " + Math.ceil(3.7));
    }
}`,
    expected: "sqrt(16.0) = 4.0"
  },

  trigonometry: {
    name: "Trigonometric Functions",
    code: `public class Trigonometry {
    public static void main(String[] args) {
        System.out.println("=== Trigonometric Functions Tests ===");
        
        double angle = Math.PI / 4; // 45 degrees
        
        // Test 1: Basic trig functions
        System.out.println("sin(π/4) = " + Math.sin(angle));
        System.out.println("cos(π/4) = " + Math.cos(angle));
        System.out.println("tan(π/4) = " + Math.tan(angle));
        
        // Test 2: Pythagorean identity
        double sinSquared = Math.pow(Math.sin(angle), 2);
        double cosSquared = Math.pow(Math.cos(angle), 2);
        double identity = sinSquared + cosSquared;
        System.out.println("sin²(π/4) + cos²(π/4) = " + identity);
        
        // Test 3: Special angles
        System.out.println("sin(0) = " + Math.sin(0));
        System.out.println("cos(0) = " + Math.cos(0));
        System.out.println("sin(π/2) = " + Math.sin(Math.PI/2));
    }
}`,
    expected: "sin(π/4) = 0.7071067811865476"
  },

  logarithms: {
    name: "Logarithmic Functions",
    code: `public class Logarithms {
    public static void main(String[] args) {
        System.out.println("=== Logarithmic Functions Tests ===");
        
        // Test 1: Natural logarithm
        System.out.println("ln(e) = " + Math.log(Math.E));
        System.out.println("ln(10) = " + Math.log(10));
        System.out.println("ln(1) = " + Math.log(1));
        
        // Test 2: Base-10 logarithm
        System.out.println("log₁₀(100) = " + Math.log10(100));
        System.out.println("log₁₀(1000) = " + Math.log10(1000));
        System.out.println("log₁₀(1) = " + Math.log10(1));
        
        // Test 3: Exponential function
        System.out.println("e¹ = " + Math.exp(1));
        System.out.println("e⁰ = " + Math.exp(0));
        
        // Test 4: Mathematical constants
        System.out.println("π = " + Math.PI);
        System.out.println("e = " + Math.E);
    }
}`,
    expected: "ln(e) = 1.0"
  },

  complexExpressions: {
    name: "Complex Mathematical Expressions",
    code: `public class ComplexExpressions {
    public static void main(String[] args) {
        System.out.println("=== Complex Mathematical Expressions ===");
        
        // Test 1: Quadratic formula
        double a = 1.0, b = -5.0, c = 6.0;
        double discriminant = Math.pow(b, 2) - 4 * a * c;
        System.out.println("Discriminant: b² - 4ac = " + discriminant);
        
        if (discriminant >= 0) {
            double x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            double x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            System.out.println("Root 1: x = " + x1);
            System.out.println("Root 2: x = " + x2);
        }
        
        // Test 2: Distance formula
        double x1 = 0, y1 = 0, x2 = 3, y2 = 4;
        double distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        System.out.println("Distance between (0,0) and (3,4): " + distance);
        
        // Test 3: Compound interest
        double principal = 1000.0;
        double rate = 0.05;
        double time = 2.0;
        double amount = principal * Math.pow(1 + rate, time);
        System.out.println("Compound interest: $" + amount);
        
        // Test 4: Circle calculations
        double radius = 5.0;
        double area = Math.PI * Math.pow(radius, 2);
        double circumference = 2 * Math.PI * radius;
        System.out.println("Circle area: " + area);
        System.out.println("Circle circumference: " + circumference);
    }
}`,
    expected: "Discriminant: b² - 4ac = 1.0"
  },

  stringConcatenation: {
    name: "String vs Arithmetic Operations",
    code: `public class StringArithmetic {
    public static void main(String[] args) {
        System.out.println("=== String vs Arithmetic Operations ===");
        
        int a = 5, b = 3;
        String str1 = "Hello", str2 = "World";
        
        // Test 1: Arithmetic addition
        int sum = a + b;
        System.out.println("Arithmetic: " + a + " + " + b + " = " + sum);
        
        // Test 2: String concatenation
        String concat = str1 + str2;
        System.out.println("String: " + str1 + " + " + str2 + " = " + concat);
        
        // Test 3: Mixed operations
        String mixed = str1 + a + b;
        System.out.println("Mixed: " + str1 + " + " + a + " + " + b + " = " + mixed);
        
        // Test 4: Parentheses in string context
        String withParens = str1 + " (" + (a + b) + ")";
        System.out.println("With parentheses: " + withParens);
    }
}`,
    expected: "Arithmetic: 5 + 3 = 8"
  },

  edgeCases: {
    name: "Edge Cases and Error Handling",
    code: `public class EdgeCases {
    public static void main(String[] args) {
        System.out.println("=== Edge Cases and Error Handling ===");
        
        // Test 1: Division by zero handling
        try {
            int a = 10, b = 0;
            int result = a / b;
            System.out.println("Division result: " + result);
        } catch (Exception e) {
            System.out.println("Division by zero handled: " + e.getMessage());
        }
        
        // Test 2: Square root of negative number
        try {
            double result = Math.sqrt(-1);
            System.out.println("sqrt(-1) = " + result);
        } catch (Exception e) {
            System.out.println("Negative sqrt handled: " + e.getMessage());
        }
        
        // Test 3: Large numbers
        double large = Math.pow(10, 10);
        System.out.println("10^10 = " + large);
        
        // Test 4: Very small numbers
        double small = Math.pow(10, -10);
        System.out.println("10^-10 = " + small);
        
        // Test 5: Infinity and NaN
        System.out.println("1.0/0.0 = " + (1.0/0.0));
        System.out.println("0.0/0.0 = " + (0.0/0.0));
    }
}`,
    expected: "10^10 = 1.0E10"
  }
};

export default function ComprehensiveTestPage() {
  const [selectedTest, setSelectedTest] = useState('operatorPrecedence');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExecutionResult | null>(null);

  const runSingleTest = async (testKey: string) => {
    const test = COMPREHENSIVE_TESTS[testKey as keyof typeof COMPREHENSIVE_TESTS];
    if (!test) return;

    setIsRunning(true);
    setCurrentResult(null);

    try {
      const response = await fetch('/api/web-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: test.code,
          language: 'java',
          testCases: [],
          questionId: 'comprehensive-test',
          userId: 'test-user',
        }),
      });

      const result: ExecutionResult = await response.json();
      setCurrentResult(result);

      const testResult: TestResult = {
        name: test.name,
        success: result.success,
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        expected: test.expected
      };

      setTestResults(prev => {
        const filtered = prev.filter(r => r.name !== test.name);
        return [...filtered, testResult];
      });

    } catch (error) {
      const testResult: TestResult = {
        name: test.name,
        success: false,
        output: '',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0
      };

      setTestResults(prev => {
        const filtered = prev.filter(r => r.name !== test.name);
        return [...filtered, testResult];
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    for (const [testKey, test] of Object.entries(COMPREHENSIVE_TESTS)) {
      await runSingleTest(testKey);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsRunning(false);
  };

  const getTestStatus = (testName: string) => {
    const result = testResults.find(r => r.name === testName);
    if (!result) return 'pending';
    return result.success ? 'passed' : 'failed';
  };

  const getOverallStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.success).length;
    const failed = total - passed;
    const avgTime = testResults.length > 0 
      ? Math.round(testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length)
      : 0;

    return { total, passed, failed, avgTime };
  };

  const stats = getOverallStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <TestTube className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Comprehensive Java Runtime Tests</h1>
        </div>
        <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Extensive testing suite for the enhanced Java runtime covering mathematical operations, 
          operator precedence, parentheses, Math functions, and edge cases.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TestTube className="h-3 w-3 mr-1" />
            {stats.total} Tests
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            {stats.passed} Passed
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            {stats.failed} Failed
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Zap className="h-3 w-3 mr-1" />
            {stats.avgTime}ms Avg
          </Badge>
        </div>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running All Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button
              onClick={() => runSingleTest(selectedTest)}
              disabled={isRunning}
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Selected Test
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(COMPREHENSIVE_TESTS).map(([key, test]) => {
                const status = getTestStatus(test.name);
                return (
                  <div
                    key={key}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTest === key 
                        ? 'border-primary bg-primary/10' 
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                    }`}
                    onClick={() => setSelectedTest(key)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{test.name}</span>
                      <div className="flex items-center gap-2">
                        {status === 'passed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                        {status === 'pending' && <div className="h-4 w-4 rounded-full bg-[var(--muted)]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentResult ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a test and click "Run Selected Test" to see results.</p>
              </div>
            ) : currentResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Test Passed</span>
                  <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                    {currentResult.executionTime}ms
                  </Badge>
                </div>
                
                <div className="bg-success/10 border border-success/20 p-4 rounded-md">
                  <h4 className="font-medium text-green-800 mb-2">Output:</h4>
                  <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                    {currentResult.output}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Test Failed</span>
                  <Badge variant="outline" className="text-xs border-red-600 text-red-600">
                    {currentResult.executionTime}ms
                  </Badge>
                </div>
                
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
                  <h4 className="font-medium text-red-800 mb-2">Error:</h4>
                  <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                    {currentResult.error}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Test Results Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                    <span>{result.executionTime}ms</span>
                    {result.expected && (
                      <span className="text-xs bg-[var(--muted)] px-2 py-1 rounded">
                        Expected: {result.expected}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

