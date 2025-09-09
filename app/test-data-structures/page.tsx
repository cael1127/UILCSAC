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
  Database,
  Code,
  Terminal,
  Zap,
  Loader2,
  TestTube,
  BarChart3,
  Layers
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

const DATA_STRUCTURE_TESTS = {
  arrayList: {
    name: "ArrayList Operations",
    code: `public class ArrayListTest {
    public static void main(String[] args) {
        System.out.println("=== ArrayList Operations ===");
        
        ArrayList<Integer> list = new ArrayList<Integer>();
        
        // Test 1: Adding elements
        list.add(10);
        list.add(20);
        list.add(30);
        System.out.println("After adding 10, 20, 30: " + list.toString());
        System.out.println("Size: " + list.size());
        
        // Test 2: Getting elements
        System.out.println("Element at index 1: " + list.get(1));
        
        // Test 3: Setting elements
        list.set(1, 25);
        System.out.println("After setting index 1 to 25: " + list.toString());
        
        // Test 4: Checking contains
        System.out.println("Contains 25: " + list.contains(25));
        System.out.println("Contains 15: " + list.contains(15));
        
        // Test 5: Finding index
        System.out.println("Index of 30: " + list.indexOf(30));
        
        // Test 6: Removing elements
        list.remove(0);
        System.out.println("After removing index 0: " + list.toString());
        
        // Test 7: Checking empty
        System.out.println("Is empty: " + list.isEmpty());
        
        // Test 8: Clearing
        list.clear();
        System.out.println("After clear - Is empty: " + list.isEmpty());
    }
}`,
    expected: "After adding 10, 20, 30: [10, 20, 30]"
  },

  hashMap: {
    name: "HashMap Operations",
    code: `public class HashMapTest {
    public static void main(String[] args) {
        System.out.println("=== HashMap Operations ===");
        
        HashMap<String, Integer> map = new HashMap<String, Integer>();
        
        // Test 1: Putting key-value pairs
        map.put("apple", 5);
        map.put("banana", 3);
        map.put("orange", 8);
        System.out.println("After adding fruits: " + map.toString());
        System.out.println("Size: " + map.size());
        
        // Test 2: Getting values
        System.out.println("Apples: " + map.get("apple"));
        System.out.println("Grapes: " + map.get("grapes"));
        
        // Test 3: Checking keys and values
        System.out.println("Contains key 'banana': " + map.containsKey("banana"));
        System.out.println("Contains value 8: " + map.containsValue(8));
        
        // Test 4: Updating values
        map.put("apple", 7);
        System.out.println("After updating apples to 7: " + map.toString());
        
        // Test 5: Removing entries
        map.remove("banana");
        System.out.println("After removing banana: " + map.toString());
        
        // Test 6: Getting all keys and values
        System.out.println("Keys: " + map.keySet().toString());
        System.out.println("Values: " + map.values().toString());
        
        // Test 7: Checking empty
        System.out.println("Is empty: " + map.isEmpty());
    }
}`,
    expected: "After adding fruits: {apple=5, banana=3, orange=8}"
  },

  hashSet: {
    name: "HashSet Operations",
    code: `public class HashSetTest {
    public static void main(String[] args) {
        System.out.println("=== HashSet Operations ===");
        
        HashSet<String> set = new HashSet<String>();
        
        // Test 1: Adding elements
        set.add("red");
        set.add("green");
        set.add("blue");
        set.add("red"); // Duplicate
        System.out.println("After adding colors: " + set.toString());
        System.out.println("Size: " + set.size());
        
        // Test 2: Checking contains
        System.out.println("Contains 'red': " + set.contains("red"));
        System.out.println("Contains 'yellow': " + set.contains("yellow"));
        
        // Test 3: Adding more elements
        set.add("yellow");
        set.add("purple");
        System.out.println("After adding yellow and purple: " + set.toString());
        
        // Test 4: Removing elements
        set.remove("green");
        System.out.println("After removing green: " + set.toString());
        
        // Test 5: Converting to array
        System.out.println("To array: " + set.toArray().toString());
        
        // Test 6: Checking empty
        System.out.println("Is empty: " + set.isEmpty());
        
        // Test 7: Clearing
        set.clear();
        System.out.println("After clear - Is empty: " + set.isEmpty());
    }
}`,
    expected: "After adding colors: {red, green, blue}"
  },

  linkedList: {
    name: "LinkedList Operations",
    code: `public class LinkedListTest {
    public static void main(String[] args) {
        System.out.println("=== LinkedList Operations ===");
        
        LinkedList<String> list = new LinkedList<String>();
        
        // Test 1: Adding elements
        list.add("first");
        list.add("second");
        list.add("third");
        System.out.println("After adding: " + list.toString());
        
        // Test 2: Adding at specific positions
        list.addFirst("zero");
        list.addLast("fourth");
        System.out.println("After addFirst and addLast: " + list.toString());
        
        // Test 3: Getting elements
        System.out.println("First element: " + list.getFirst());
        System.out.println("Last element: " + list.getLast());
        System.out.println("Element at index 2: " + list.get(2));
        
        // Test 4: Removing elements
        list.removeFirst();
        list.removeLast();
        System.out.println("After removing first and last: " + list.toString());
        
        // Test 5: Size and contains
        System.out.println("Size: " + list.size());
        System.out.println("Contains 'second': " + list.contains("second"));
        
        // Test 6: Index operations
        System.out.println("Index of 'third': " + list.indexOf("third"));
        
        // Test 7: Removing by index
        list.remove(1);
        System.out.println("After removing index 1: " + list.toString());
    }
}`,
    expected: "After adding: [first, second, third]"
  },

  stack: {
    name: "Stack Operations",
    code: `public class StackTest {
    public static void main(String[] args) {
        System.out.println("=== Stack Operations ===");
        
        Stack<Integer> stack = new Stack<Integer>();
        
        // Test 1: Pushing elements
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("After pushing 10, 20, 30: " + stack.toString());
        System.out.println("Size: " + stack.size());
        
        // Test 2: Peeking
        System.out.println("Top element (peek): " + stack.peek());
        
        // Test 3: Popping elements
        System.out.println("Popped: " + stack.pop());
        System.out.println("After pop: " + stack.toString());
        System.out.println("Top element: " + stack.peek());
        
        // Test 4: More operations
        stack.push(40);
        stack.push(50);
        System.out.println("After pushing 40, 50: " + stack.toString());
        
        // Test 5: Checking contains
        System.out.println("Contains 20: " + stack.contains(20));
        System.out.println("Contains 60: " + stack.contains(60));
        
        // Test 6: Size and empty
        System.out.println("Size: " + stack.size());
        System.out.println("Is empty: " + stack.isEmpty());
        
        // Test 7: Popping all elements
        while (!stack.isEmpty()) {
            System.out.println("Popping: " + stack.pop());
        }
        System.out.println("After popping all - Is empty: " + stack.isEmpty());
    }
}`,
    expected: "After pushing 10, 20, 30: [10, 20, 30]"
  },

  queue: {
    name: "Queue Operations",
    code: `public class QueueTest {
    public static void main(String[] args) {
        System.out.println("=== Queue Operations ===");
        
        Queue<String> queue = new Queue<String>();
        
        // Test 1: Adding elements
        queue.offer("first");
        queue.offer("second");
        queue.offer("third");
        System.out.println("After offering: " + queue.toString());
        System.out.println("Size: " + queue.size());
        
        // Test 2: Peeking
        System.out.println("Front element (peek): " + queue.peek());
        
        // Test 3: Polling elements
        System.out.println("Polled: " + queue.poll());
        System.out.println("After poll: " + queue.toString());
        System.out.println("Front element: " + queue.peek());
        
        // Test 4: More operations
        queue.add("fourth");
        queue.add("fifth");
        System.out.println("After adding fourth, fifth: " + queue.toString());
        
        // Test 5: Checking contains
        System.out.println("Contains 'third': " + queue.contains("third"));
        System.out.println("Contains 'sixth': " + queue.contains("sixth"));
        
        // Test 6: Size and empty
        System.out.println("Size: " + queue.size());
        System.out.println("Is empty: " + queue.isEmpty());
        
        // Test 7: Polling all elements
        while (!queue.isEmpty()) {
            System.out.println("Polling: " + queue.poll());
        }
        System.out.println("After polling all - Is empty: " + queue.isEmpty());
    }
}`,
    expected: "After offering: [first, second, third]"
  },

  priorityQueue: {
    name: "PriorityQueue Operations",
    code: `public class PriorityQueueTest {
    public static void main(String[] args) {
        System.out.println("=== PriorityQueue Operations ===");
        
        PriorityQueue<Integer> pq = new PriorityQueue<Integer>();
        
        // Test 1: Adding elements (not in order)
        pq.offer(30);
        pq.offer(10);
        pq.offer(50);
        pq.offer(20);
        System.out.println("After offering 30, 10, 50, 20: " + pq.toString());
        System.out.println("Size: " + pq.size());
        
        // Test 2: Peeking (should be minimum)
        System.out.println("Min element (peek): " + pq.peek());
        
        // Test 3: Polling elements (should be in sorted order)
        System.out.println("Polled: " + pq.poll());
        System.out.println("After poll: " + pq.toString());
        System.out.println("Min element: " + pq.peek());
        
        // Test 4: More operations
        pq.add(5);
        pq.add(40);
        System.out.println("After adding 5, 40: " + pq.toString());
        
        // Test 5: Checking contains
        System.out.println("Contains 20: " + pq.contains(20));
        System.out.println("Contains 60: " + pq.contains(60));
        
        // Test 6: Size and empty
        System.out.println("Size: " + pq.size());
        System.out.println("Is empty: " + pq.isEmpty());
        
        // Test 7: Polling all elements (should be in sorted order)
        System.out.println("Polling all elements in order:");
        while (!pq.isEmpty()) {
            System.out.println("Polled: " + pq.poll());
        }
        System.out.println("After polling all - Is empty: " + pq.isEmpty());
    }
}`,
    expected: "After offering 30, 10, 50, 20: [10, 20, 30, 50]"
  },

  treeSet: {
    name: "TreeSet Operations",
    code: `public class TreeSetTest {
    public static void main(String[] args) {
        System.out.println("=== TreeSet Operations ===");
        
        TreeSet<Integer> set = new TreeSet<Integer>();
        
        // Test 1: Adding elements (not in order)
        set.add(30);
        set.add(10);
        set.add(50);
        set.add(20);
        set.add(10); // Duplicate
        System.out.println("After adding 30, 10, 50, 20, 10: " + set.toString());
        System.out.println("Size: " + set.size());
        
        // Test 2: First and last elements
        System.out.println("First element: " + set.first());
        System.out.println("Last element: " + set.last());
        
        // Test 3: Checking contains
        System.out.println("Contains 20: " + set.contains(20));
        System.out.println("Contains 60: " + set.contains(60));
        
        // Test 4: Removing elements
        set.remove(30);
        System.out.println("After removing 30: " + set.toString());
        
        // Test 5: Converting to array
        System.out.println("To array: " + set.toArray().toString());
        
        // Test 6: Size and empty
        System.out.println("Size: " + set.size());
        System.out.println("Is empty: " + set.isEmpty());
        
        // Test 7: String TreeSet
        TreeSet<String> stringSet = new TreeSet<String>();
        stringSet.add("zebra");
        stringSet.add("apple");
        stringSet.add("banana");
        System.out.println("String TreeSet: " + stringSet.toString());
    }
}`,
    expected: "After adding 30, 10, 50, 20, 10: {10, 20, 30, 50}"
  },

  treeMap: {
    name: "TreeMap Operations",
    code: `public class TreeMapTest {
    public static void main(String[] args) {
        System.out.println("=== TreeMap Operations ===");
        
        TreeMap<String, Integer> map = new TreeMap<String, Integer>();
        
        // Test 1: Adding key-value pairs (not in order)
        map.put("zebra", 5);
        map.put("apple", 3);
        map.put("banana", 8);
        map.put("cherry", 2);
        System.out.println("After adding: " + map.toString());
        System.out.println("Size: " + map.size());
        
        // Test 2: First and last keys
        System.out.println("First key: " + map.firstKey());
        System.out.println("Last key: " + map.lastKey());
        
        // Test 3: Getting values
        System.out.println("Value for 'banana': " + map.get("banana"));
        System.out.println("Value for 'grape': " + map.get("grape"));
        
        // Test 4: Checking keys and values
        System.out.println("Contains key 'apple': " + map.containsKey("apple"));
        System.out.println("Contains value 8: " + map.containsValue(8));
        
        // Test 5: Removing entries
        map.remove("cherry");
        System.out.println("After removing cherry: " + map.toString());
        
        // Test 6: Getting all keys and values (sorted)
        System.out.println("Keys (sorted): " + map.keySet().toString());
        System.out.println("Values: " + map.values().toString());
        
        // Test 7: Entry set
        System.out.println("Entry set: " + map.entrySet().toString());
        
        // Test 8: Numeric TreeMap
        TreeMap<Integer, String> numMap = new TreeMap<Integer, String>();
        numMap.put(30, "thirty");
        numMap.put(10, "ten");
        numMap.put(50, "fifty");
        System.out.println("Numeric TreeMap: " + numMap.toString());
    }
}`,
    expected: "After adding: {apple=3, banana=8, cherry=2, zebra=5}"
  },

  complexDataStructures: {
    name: "Complex Data Structure Operations",
    code: `public class ComplexDataStructures {
    public static void main(String[] args) {
        System.out.println("=== Complex Data Structure Operations ===");
        
        // Test 1: ArrayList of ArrayLists
        ArrayList<ArrayList<Integer>> matrix = new ArrayList<ArrayList<Integer>>();
        ArrayList<Integer> row1 = new ArrayList<Integer>();
        row1.add(1);
        row1.add(2);
        row1.add(3);
        ArrayList<Integer> row2 = new ArrayList<Integer>();
        row2.add(4);
        row2.add(5);
        row2.add(6);
        matrix.add(row1);
        matrix.add(row2);
        System.out.println("Matrix: " + matrix.toString());
        
        // Test 2: HashMap with ArrayList values
        HashMap<String, ArrayList<String>> groups = new HashMap<String, ArrayList<String>>();
        ArrayList<String> fruits = new ArrayList<String>();
        fruits.add("apple");
        fruits.add("banana");
        ArrayList<String> colors = new ArrayList<String>();
        colors.add("red");
        colors.add("blue");
        groups.put("fruits", fruits);
        groups.put("colors", colors);
        System.out.println("Groups: " + groups.toString());
        
        // Test 3: Stack of HashMaps
        Stack<HashMap<String, Integer>> stack = new Stack<HashMap<String, Integer>>();
        HashMap<String, Integer> map1 = new HashMap<String, Integer>();
        map1.put("a", 1);
        map1.put("b", 2);
        HashMap<String, Integer> map2 = new HashMap<String, Integer>();
        map2.put("c", 3);
        map2.put("d", 4);
        stack.push(map1);
        stack.push(map2);
        System.out.println("Stack of maps: " + stack.toString());
        
        // Test 4: PriorityQueue with custom objects (using strings)
        PriorityQueue<String> tasks = new PriorityQueue<String>();
        tasks.offer("high priority");
        tasks.offer("low priority");
        tasks.offer("medium priority");
        System.out.println("Tasks: " + tasks.toString());
        
        // Test 5: TreeSet of TreeMaps
        TreeSet<String> setOfMaps = new TreeSet<String>();
        setOfMaps.add("map1");
        setOfMaps.add("map2");
        setOfMaps.add("map3");
        System.out.println("Set of maps: " + setOfMaps.toString());
        
        // Test 6: Complex nested operations
        ArrayList<HashMap<String, ArrayList<Integer>>> complex = new ArrayList<HashMap<String, ArrayList<Integer>>>();
        HashMap<String, ArrayList<Integer>> innerMap = new HashMap<String, ArrayList<Integer>>();
        ArrayList<Integer> numbers = new ArrayList<Integer>();
        numbers.add(10);
        numbers.add(20);
        innerMap.put("numbers", numbers);
        complex.add(innerMap);
        System.out.println("Complex structure: " + complex.toString());
    }
}`,
    expected: "Matrix: [[1, 2, 3], [4, 5, 6]]"
  }
};

export default function DataStructuresTestPage() {
  const [selectedTest, setSelectedTest] = useState('arrayList');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExecutionResult | null>(null);

  const runSingleTest = async (testKey: string) => {
    const test = DATA_STRUCTURE_TESTS[testKey as keyof typeof DATA_STRUCTURE_TESTS];
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
          questionId: 'data-structures-test',
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

    for (const [testKey, test] of Object.entries(DATA_STRUCTURE_TESTS)) {
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
          <Database className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Data Structures Test Suite</h1>
        </div>
        <p className="text-lg text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Comprehensive testing of all supported data structures including ArrayList, HashMap, HashSet, 
          LinkedList, Stack, Queue, PriorityQueue, TreeSet, and TreeMap with their complete API.
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Database className="h-3 w-3 mr-1" />
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
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Data Structure Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(DATA_STRUCTURE_TESTS).map(([key, test]) => {
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
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a data structure test and click "Run Selected Test" to see results.</p>
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

                {currentResult.variables && Object.keys(currentResult.variables).length > 0 && (
                  <div className="bg-[var(--muted)] border border-[var(--border)] p-4 rounded-md">
                    <h4 className="font-medium text-[var(--foreground)] mb-2">Variables:</h4>
                    <pre className="text-sm text-[var(--muted-foreground)]">
                      {JSON.stringify(currentResult.variables, null, 2)}
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

      {/* Data Structure Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Data Structures & Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">ArrayList</h4>
              <p className="text-sm text-[var(--muted-foreground)]">add, get, set, remove, size, isEmpty, contains, indexOf, clear</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">HashMap</h4>
              <p className="text-sm text-[var(--muted-foreground)]">put, get, containsKey, containsValue, remove, size, keySet, values</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">HashSet</h4>
              <p className="text-sm text-[var(--muted-foreground)]">add, contains, remove, size, isEmpty, clear, toArray</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">LinkedList</h4>
              <p className="text-sm text-[var(--muted-foreground)]">add, addFirst, addLast, get, getFirst, getLast, remove, removeFirst, removeLast</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Stack</h4>
              <p className="text-sm text-[var(--muted-foreground)]">push, pop, peek, size, isEmpty, contains, clear</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">Queue</h4>
              <p className="text-sm text-[var(--muted-foreground)]">offer, add, poll, remove, peek, element, size, isEmpty</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">PriorityQueue</h4>
              <p className="text-sm text-[var(--muted-foreground)]">offer, add, poll, remove, peek, element, size, isEmpty (min-heap)</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">TreeSet</h4>
              <p className="text-sm text-[var(--muted-foreground)]">add, contains, remove, first, last, size, isEmpty, toArray (sorted)</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--foreground)]">TreeMap</h4>
              <p className="text-sm text-[var(--muted-foreground)]">put, get, containsKey, containsValue, remove, firstKey, lastKey, keySet (sorted)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

