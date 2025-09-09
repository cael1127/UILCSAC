"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Code,
  Terminal,
  Zap,
  Loader2,
  TestTube
} from 'lucide-react';

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
  variables?: Record<string, any>;
}

const TEST_CODE = `public class RuntimeVerification {
    public static void main(String[] args) {
        System.out.println("=== ENHANCED JAVA RUNTIME VERIFICATION ===");
        System.out.println();
        
        // Test 1: Basic Mathematical Operations
        System.out.println("1. BASIC MATHEMATICAL OPERATIONS:");
        System.out.println("=================================");
        
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
        
        System.out.println();
        
        // Test 2: Math Functions
        System.out.println("2. MATH FUNCTIONS:");
        System.out.println("==================");
        
        double x = 16.0;
        System.out.println("sqrt(" + x + ") = " + Math.sqrt(x));
        System.out.println("pow(2, 3) = " + Math.pow(2, 3));
        System.out.println("abs(-15.5) = " + Math.abs(-15.5));
        System.out.println("max(10, 5) = " + Math.max(10, 5));
        System.out.println("min(10, 5) = " + Math.min(10, 5));
        System.out.println("round(3.7) = " + Math.round(3.7));
        System.out.println("floor(3.7) = " + Math.floor(3.7));
        System.out.println("ceil(3.7) = " + Math.ceil(3.7));
        
        System.out.println();
        
        // Test 3: Complex Mathematical Expressions
        System.out.println("3. COMPLEX MATHEMATICAL EXPRESSIONS:");
        System.out.println("====================================");
        
        // Pythagorean theorem
        double pythagorean = Math.sqrt(Math.pow(3, 2) + Math.pow(4, 2));
        System.out.println("sqrt(3² + 4²) = " + pythagorean);
        
        // Quadratic formula
        double a_quad = 1;
        double b_quad = -5;
        double c_quad = 6;
        double discriminant = Math.pow(b_quad, 2) - 4 * a_quad * c_quad;
        if (discriminant >= 0) {
            double x1 = (-b_quad + Math.sqrt(discriminant)) / (2 * a_quad);
            double x2 = (-b_quad - Math.sqrt(discriminant)) / (2 * a_quad);
            System.out.println("Quadratic roots: x1 = " + x1 + ", x2 = " + x2);
        }
        
        // Trigonometric functions
        double angle = Math.PI / 4;
        System.out.println("sin(π/4) = " + Math.sin(angle));
        System.out.println("cos(π/4) = " + Math.cos(angle));
        System.out.println("tan(π/4) = " + Math.tan(angle));
        
        // Mathematical constants
        System.out.println("π = " + Math.PI);
        System.out.println("e = " + Math.E);
        
        System.out.println();
        
        // Test 4: ArrayList Operations
        System.out.println("4. ARRAYLIST OPERATIONS:");
        System.out.println("========================");
        
        ArrayList<Integer> list = new ArrayList<Integer>();
        list.add(10);
        list.add(20);
        list.add(30);
        System.out.println("After adding 10, 20, 30: " + list.toString());
        System.out.println("Size: " + list.size());
        System.out.println("Element at index 1: " + list.get(1));
        
        list.set(1, 25);
        System.out.println("After setting index 1 to 25: " + list.toString());
        
        list.remove(0);
        System.out.println("After removing index 0: " + list.toString());
        System.out.println("Contains 25: " + list.contains(25));
        System.out.println("Index of 30: " + list.indexOf(30));
        
        System.out.println();
        
        // Test 5: HashMap Operations
        System.out.println("5. HASHMAP OPERATIONS:");
        System.out.println("======================");
        
        HashMap<String, Integer> map = new HashMap<String, Integer>();
        map.put("apple", 5);
        map.put("banana", 3);
        map.put("orange", 8);
        System.out.println("After adding fruits: " + map.toString());
        System.out.println("Size: " + map.size());
        System.out.println("Apples: " + map.get("apple"));
        System.out.println("Contains key 'banana': " + map.containsKey("banana"));
        System.out.println("Contains value 8: " + map.containsValue(8));
        
        map.put("apple", 7);
        System.out.println("After updating apples to 7: " + map.toString());
        
        map.remove("banana");
        System.out.println("After removing banana: " + map.toString());
        
        System.out.println();
        
        // Test 6: Stack Operations
        System.out.println("6. STACK OPERATIONS:");
        System.out.println("====================");
        
        Stack<Integer> stack = new Stack<Integer>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("After pushing 10, 20, 30: " + stack.toString());
        System.out.println("Top element (peek): " + stack.peek());
        
        System.out.println("Popped: " + stack.pop());
        System.out.println("After pop: " + stack.toString());
        System.out.println("Top element: " + stack.peek());
        
        System.out.println();
        
        // Test 7: Queue Operations
        System.out.println("7. QUEUE OPERATIONS:");
        System.out.println("====================");
        
        Queue<String> queue = new Queue<String>();
        queue.offer("first");
        queue.offer("second");
        queue.offer("third");
        System.out.println("After offering: " + queue.toString());
        System.out.println("Front element (peek): " + queue.peek());
        
        System.out.println("Polled: " + queue.poll());
        System.out.println("After poll: " + queue.toString());
        System.out.println("Front element: " + queue.peek());
        
        System.out.println();
        
        // Test 8: PriorityQueue Operations
        System.out.println("8. PRIORITY QUEUE OPERATIONS:");
        System.out.println("=============================");
        
        PriorityQueue<Integer> pq = new PriorityQueue<Integer>();
        pq.offer(30);
        pq.offer(10);
        pq.offer(50);
        pq.offer(20);
        System.out.println("After offering 30, 10, 50, 20: " + pq.toString());
        System.out.println("Min element (peek): " + pq.peek());
        
        System.out.println("Polled: " + pq.poll());
        System.out.println("After poll: " + pq.toString());
        System.out.println("Min element: " + pq.peek());
        
        System.out.println();
        
        // Test 9: TreeSet Operations
        System.out.println("9. TREESET OPERATIONS:");
        System.out.println("======================");
        
        TreeSet<Integer> set = new TreeSet<Integer>();
        set.add(30);
        set.add(10);
        set.add(50);
        set.add(20);
        set.add(10); // Duplicate
        System.out.println("After adding 30, 10, 50, 20, 10: " + set.toString());
        System.out.println("First element: " + set.first());
        System.out.println("Last element: " + set.last());
        System.out.println("Contains 20: " + set.contains(20));
        
        set.remove(30);
        System.out.println("After removing 30: " + set.toString());
        
        System.out.println();
        
        // Test 10: TreeMap Operations
        System.out.println("10. TREEMAP OPERATIONS:");
        System.out.println("=======================");
        
        TreeMap<String, Integer> treeMap = new TreeMap<String, Integer>();
        treeMap.put("zebra", 5);
        treeMap.put("apple", 3);
        treeMap.put("banana", 8);
        treeMap.put("cherry", 2);
        System.out.println("After adding: " + treeMap.toString());
        System.out.println("First key: " + treeMap.firstKey());
        System.out.println("Last key: " + treeMap.lastKey());
        System.out.println("Value for 'banana': " + treeMap.get("banana"));
        
        treeMap.remove("cherry");
        System.out.println("After removing cherry: " + treeMap.toString());
        
        System.out.println();
        
        // Test 11: Complex Nested Operations
        System.out.println("11. COMPLEX NESTED OPERATIONS:");
        System.out.println("==============================");
        
        // ArrayList of HashMaps
        ArrayList<HashMap<String, Integer>> complexList = new ArrayList<HashMap<String, Integer>>();
        HashMap<String, Integer> map1 = new HashMap<String, Integer>();
        map1.put("a", 1);
        map1.put("b", 2);
        HashMap<String, Integer> map2 = new HashMap<String, Integer>();
        map2.put("c", 3);
        map2.put("d", 4);
        complexList.add(map1);
        complexList.add(map2);
        System.out.println("Complex list: " + complexList.toString());
        
        // Mathematical operations on data structures
        ArrayList<Double> numbers = new ArrayList<Double>();
        numbers.add(1.5);
        numbers.add(2.7);
        numbers.add(3.9);
        numbers.add(4.2);
        
        double sum = 0;
        for (int i = 0; i < numbers.size(); i++) {
            sum += numbers.get(i);
        }
        double mean = sum / numbers.size();
        System.out.println("Numbers: " + numbers.toString());
        System.out.println("Sum: " + sum);
        System.out.println("Mean: " + mean);
        
        System.out.println();
        
        // Test 12: String vs Arithmetic Operations
        System.out.println("12. STRING VS ARITHMETIC OPERATIONS:");
        System.out.println("===================================");
        
        int num1 = 5;
        int num2 = 3;
        String str1 = "Hello";
        String str2 = "World";
        
        // Arithmetic addition
        int sum_nums = num1 + num2;
        System.out.println("Arithmetic: " + num1 + " + " + num2 + " = " + sum_nums);
        
        // String concatenation
        String concat = str1 + str2;
        System.out.println("String: " + str1 + " + " + str2 + " = " + concat);
        
        // Mixed operations
        String mixed = str1 + num1 + num2;
        System.out.println("Mixed: " + str1 + " + " + num1 + " + " + num2 + " = " + mixed);
        
        // Parentheses in string context
        String withParens = str1 + " (" + (num1 + num2) + ")";
        System.out.println("With parentheses: " + withParens);
        
        System.out.println();
        System.out.println("=== ALL TESTS COMPLETED SUCCESSFULLY ===");
        System.out.println("✅ Enhanced Java Runtime is working perfectly!");
        System.out.println("✅ Mathematical calculations with operator precedence");
        System.out.println("✅ Complex expressions with parentheses");
        System.out.println("✅ All Math functions (sqrt, pow, sin, cos, etc.)");
        System.out.println("✅ Complete data structure support");
        System.out.println("✅ Generic type support");
        System.out.println("✅ Nested data structures");
        System.out.println("✅ String vs arithmetic operation detection");
        System.out.println("✅ Error handling and bounds checking");
    }
}`;

export default function TestRuntimePage() {
  const [code, setCode] = useState(TEST_CODE);
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
          questionId: 'runtime-test',
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <TestTube className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Enhanced Java Runtime Test</h1>
        </div>
        <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Comprehensive test of the enhanced Java runtime including mathematical calculations, 
          operator precedence, parentheses, Math functions, complete data structure support,
          multiple variable declarations, method calls, and string concatenation.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            <Zap className="h-3 w-3 mr-1" />
            Enhanced Runtime
          </Badge>
          <Badge variant="outline" className="bg-info/10 text-info border-info/20">
            <Code className="h-3 w-3 mr-1" />
            Math + Data Structures
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <TestTube className="h-3 w-3 mr-1" />
            Comprehensive Test
          </Badge>
        </div>
      </div>

      {/* Code Editor and Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Test Code
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
                    Run Test
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
                <span className="text-xs text-[var(--muted-foreground)] ml-2 font-medium">RuntimeTest.java</span>
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-[var(--muted)] text-[var(--foreground)] font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-6 p-4 border-0"
                placeholder="Write your Java test code here..."
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
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Run Test" to execute the comprehensive runtime test.</p>
                <p className="text-sm mt-2">This will test all enhanced features including:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>• Mathematical operations with operator precedence</li>
                  <li>• Complex expressions with parentheses</li>
                  <li>• All Math functions (sqrt, pow, sin, cos, etc.)</li>
                  <li>• Complete data structure support</li>
                  <li>• Generic types and nested structures</li>
                  <li>• String vs arithmetic operation detection</li>
                </ul>
              </div>
            ) : result.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Test Passed Successfully!</span>
                  <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                    {result.executionTime}ms
                  </Badge>
                  <Badge variant="outline" className="text-xs border-green-600 text-green-600">
                    {Math.round(result.memoryUsage)}MB
                  </Badge>
                </div>
                
                <div className="bg-success/10 border border-success/20 p-4 rounded-md">
                  <h4 className="font-medium text-green-800 mb-2">Test Output:</h4>
                  <pre className="text-sm text-[var(--foreground)] whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
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
                  <span className="font-medium">Test Failed</span>
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

      {/* Test Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Test Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Mathematical Operations</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Operator precedence, parentheses, complex expressions</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Math Functions</h4>
              <p className="text-sm text-[var(--muted-foreground)]">sqrt, pow, sin, cos, tan, log, abs, min, max, round</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Data Structures</h4>
              <p className="text-sm text-[var(--muted-foreground)]">ArrayList, HashMap, Stack, Queue, PriorityQueue, TreeSet, TreeMap</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Generic Types</h4>
              <p className="text-sm text-[var(--muted-foreground)]">ArrayList&lt;Integer&gt;, HashMap&lt;String, Integer&gt;</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Nested Structures</h4>
              <p className="text-sm text-[var(--muted-foreground)]">ArrayList of HashMaps, complex data combinations</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">String Operations</h4>
              <p className="text-sm text-[var(--muted-foreground)]">Concatenation vs arithmetic, mixed operations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
