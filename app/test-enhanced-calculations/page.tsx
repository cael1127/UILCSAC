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
  Loader2
} from 'lucide-react';

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
}

const COMPLEX_CALCULATION_EXAMPLES = {
  basicArithmetic: `public class BasicArithmetic {
    public static void main(String[] args) {
        System.out.println("=== Basic Arithmetic with Operator Precedence ===");
        
        int a = 10;
        int b = 5;
        int c = 2;
        
        // Test operator precedence
        int result1 = a + b * c;
        System.out.println("a + b * c = " + a + " + " + b + " * " + c + " = " + result1);
        
        // Test parentheses
        int result2 = (a + b) * c;
        System.out.println("(a + b) * c = (" + a + " + " + b + ") * " + c + " = " + result2);
        
        // Test division
        double result3 = (double)(a + b) / c;
        System.out.println("(a + b) / c = (" + a + " + " + b + ") / " + c + " = " + result3);
    }
}`,

  mathFunctions: `public class MathFunctions {
    public static void main(String[] args) {
        System.out.println("=== Math Functions ===");
        
        double x = 16.0;
        double y = 2.0;
        double z = 3.0;
        
        // Square root
        System.out.println("Math.sqrt(" + x + ") = " + Math.sqrt(x));
        
        // Power
        System.out.println("Math.pow(" + y + ", " + z + ") = " + Math.pow(y, z));
        
        // Absolute value
        System.out.println("Math.abs(-15.5) = " + Math.abs(-15.5));
        
        // Min/Max
        System.out.println("Math.max(" + x + ", " + y + ") = " + Math.max(x, y));
        System.out.println("Math.min(" + x + ", " + y + ") = " + Math.min(x, y));
        
        // Rounding
        System.out.println("Math.round(3.7) = " + Math.round(3.7));
        System.out.println("Math.floor(3.7) = " + Math.floor(3.7));
        System.out.println("Math.ceil(3.7) = " + Math.ceil(3.7));
    }
}`,

  trigonometry: `public class Trigonometry {
    public static void main(String[] args) {
        System.out.println("=== Trigonometric Functions ===");
        
        double angle = Math.PI / 4; // 45 degrees
        
        System.out.println("Angle: π/4 radians (45 degrees)");
        System.out.println("Math.sin(π/4) = " + Math.sin(angle));
        System.out.println("Math.cos(π/4) = " + Math.cos(angle));
        System.out.println("Math.tan(π/4) = " + Math.tan(angle));
        
        // Pythagorean identity: sin²(x) + cos²(x) = 1
        double identity = Math.pow(Math.sin(angle), 2) + Math.pow(Math.cos(angle), 2);
        System.out.println("sin²(π/4) + cos²(π/4) = " + identity);
    }
}`,

  logarithms: `public class Logarithms {
    public static void main(String[] args) {
        System.out.println("=== Logarithmic Functions ===");
        
        // Natural logarithm
        System.out.println("Math.log(Math.E) = " + Math.log(Math.E));
        System.out.println("Math.log(10) = " + Math.log(10));
        
        // Base-10 logarithm
        System.out.println("Math.log10(100) = " + Math.log10(100));
        System.out.println("Math.log10(1000) = " + Math.log10(1000));
        
        // Exponential function
        System.out.println("Math.exp(1) = " + Math.exp(1));
        System.out.println("Math.exp(2) = " + Math.exp(2));
        
        // Mathematical constants
        System.out.println("Math.PI = " + Math.PI);
        System.out.println("Math.E = " + Math.E);
    }
}`,

  complexExpressions: `public class ComplexExpressions {
    public static void main(String[] args) {
        System.out.println("=== Complex Mathematical Expressions ===");
        
        // Quadratic formula: x = (-b ± sqrt(b² - 4ac)) / 2a
        double a = 1.0;
        double b = -5.0;
        double c = 6.0;
        
        double discriminant = Math.pow(b, 2) - 4 * a * c;
        System.out.println("Discriminant: b² - 4ac = " + discriminant);
        
        if (discriminant >= 0) {
            double x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            double x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            System.out.println("Root 1: x = " + x1);
            System.out.println("Root 2: x = " + x2);
        }
        
        // Distance formula: sqrt((x2-x1)² + (y2-y1)²)
        double x1 = 0, y1 = 0;
        double x2 = 3, y2 = 4;
        double distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        System.out.println("Distance between (0,0) and (3,4): " + distance);
        
        // Compound interest: A = P(1 + r/n)^(nt)
        double principal = 1000.0;
        double rate = 0.05;
        double time = 2.0;
        double compoundAmount = principal * Math.pow(1 + rate, time);
        System.out.println("Compound interest: $" + compoundAmount);
    }
}`,

  customCalculation: `public class CustomCalculation {
    public static void main(String[] args) {
        System.out.println("=== Your Custom Calculation ===");
        
        // Write your own complex calculation here
        // Example: Calculate the area of a circle with radius 5
        double radius = 5.0;
        double area = Math.PI * Math.pow(radius, 2);
        System.out.println("Area of circle with radius " + radius + ": " + area);
        
        // Example: Calculate compound growth
        double initialValue = 100.0;
        double growthRate = 0.1;
        int years = 5;
        double finalValue = initialValue * Math.pow(1 + growthRate, years);
        System.out.println("Growth from " + initialValue + " at " + (growthRate * 100) + "% for " + years + " years: " + finalValue);
    }
}`
};

export default function TestEnhancedCalculations() {
  const [selectedExample, setSelectedExample] = useState('basicArithmetic');
  const [code, setCode] = useState(COMPLEX_CALCULATION_EXAMPLES.basicArithmetic);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setResult(null);

    try {
      const response = await fetch('/api/web-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: 'java',
          testCases: [],
          questionId: 'test-calculations',
          userId: 'test-user',
        }),
      });

      const executionResult: ExecutionResult = await response.json();
      setResult(executionResult);
    } catch (error) {
      setResult({
        success: false,
        output: '',
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime: 0,
        memoryUsage: 0,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const changeExample = (example: string) => {
    setSelectedExample(example);
    setCode(COMPLEX_CALCULATION_EXAMPLES[example as keyof typeof COMPLEX_CALCULATION_EXAMPLES]);
    setResult(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Calculator className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Enhanced Java Calculations</h1>
        </div>
        <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Test the enhanced Java runtime with complex mathematical calculations, 
          operator precedence, parentheses, and Math functions.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="h-3 w-3 mr-1" />
            Enhanced Runtime
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Calculator className="h-3 w-3 mr-1" />
            Complex Math
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Code className="h-3 w-3 mr-1" />
            Operator Precedence
          </Badge>
        </div>
      </div>

      {/* Example Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Calculation Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.entries(COMPLEX_CALCULATION_EXAMPLES).map(([key, _]) => (
              <Button
                key={key}
                variant={selectedExample === key ? "default" : "outline"}
                size="sm"
                onClick={() => changeExample(key)}
                className="text-xs"
              >
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Editor and Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Java Code
              </CardTitle>
              <Button
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
                className="bg-blue-600 hover:bg-blue-700"
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
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 border border-gray-600 rounded-md overflow-hidden">
              <div className="bg-gray-800 px-3 py-2 border-b border-gray-600 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-[var(--muted-foreground)] ml-2 font-medium">Calculation.java</span>
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-[var(--muted)] text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-6 p-4 border-0"
                placeholder="Write your Java calculation code here..."
                spellCheck={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Execution Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Run Code" to see the calculation results here.</p>
              </div>
            ) : result.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Execution Successful</span>
                  <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                    {result.executionTime}ms
                  </Badge>
                  <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                    {Math.round(result.memoryUsage)}MB
                  </Badge>
                </div>
                
                <div className="bg-success/10 border border-success/20 p-4 rounded-md">
                  <h4 className="font-medium text-green-800 mb-2">Calculation Output:</h4>
                  <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-mono">
                    {result.output}
                  </pre>
                </div>

                {result.variables && Object.keys(result.variables).length > 0 && (
                  <div className="bg-[var(--muted)] border border-[var(--border)] p-4 rounded-md">
                    <h4 className="font-medium text-[var(--foreground)] mb-2">Variables:</h4>
                    <pre className="text-sm text-[var(--muted-foreground)]">
                      {JSON.stringify(result.variables, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Execution Failed</span>
                  <Badge variant="outline" className="text-xs border-red-600 text-red-600">
                    {result.executionTime}ms
                  </Badge>
                </div>
                
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
                  <h4 className="font-medium text-red-800 mb-2">Error Details:</h4>
                  <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                    {result.error}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Calculation Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Operator Precedence</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Proper handling of *, /, +, - with correct precedence</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Parentheses Support</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Complex expressions with nested parentheses</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Math Functions</h4>
              <p className="text-sm text-[var(--muted-foreground)]">sqrt, pow, sin, cos, log, abs, min, max, etc.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Mathematical Constants</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Math.PI, Math.E, and other constants</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

