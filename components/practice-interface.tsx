"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Play, Send, Clock, Trophy, Target, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { UnifiedJavaIDE } from "./unified-java-ide"
import { TestingService } from "@/lib/testing-service"

interface TestCase {
  id: string
  input: string
  expected_output: string
  is_sample: boolean
  points: number
}

interface Problem {
  id: string
  title: string
  description: string
  input_format: string
  output_format: string
  constraints?: string
  sample_input: string
  sample_output: string
  explanation?: string
  points: number
  time_limit: number
  memory_limit: number
  category?: string
  difficulty_level?: number
  user_progress?: { status: string; best_score: number; attempts: number }
  test_cases: TestCase[]
}

interface PracticeInterfaceProps {
  problem: Problem
  userId: string
}

interface TestResult {
  passed: boolean
  input: string
  expected: string
  actual: string
  error?: string
  executionTime: number
  memoryUsed: number
}

export default function PracticeInterface({ problem, userId }: PracticeInterfaceProps) {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("java")
  const [customInput, setCustomInput] = useState("")
  const [customOutput, setCustomOutput] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<any>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  const [fontSize, setFontSize] = useState(14)

  const userProgress = problem.user_progress
  const status = userProgress?.status || "not_attempted"

  // Load saved code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem(`problem-${problem.id}-code`)
    const savedLanguage = localStorage.getItem(`problem-${problem.id}-language`)
    const savedTheme = localStorage.getItem("editor-theme")
    const savedFontSize = localStorage.getItem("editor-font-size")

    if (savedCode) setCode(savedCode)
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedTheme) setEditorTheme(savedTheme)
    if (savedFontSize) setFontSize(Number.parseInt(savedFontSize))
  }, [problem.id])

  // Save code to localStorage
  useEffect(() => {
    if (code) {
      localStorage.setItem(`problem-${problem.id}-code`, code)
    }
  }, [code, problem.id])

  // Save language preference
  useEffect(() => {
    localStorage.setItem(`problem-${problem.id}-language`, language)
  }, [language, problem.id])

  // Save editor preferences
  useEffect(() => {
    localStorage.setItem("editor-theme", editorTheme)
  }, [editorTheme])

  useEffect(() => {
    localStorage.setItem("editor-font-size", fontSize.toString())
  }, [fontSize])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Start timer when user starts typing
  useEffect(() => {
    if (code.trim() && !isTimerRunning) {
      setIsTimerRunning(true)
    }
  }, [code, isTimerRunning])

  // Set default code templates
  useEffect(() => {
    if (!code) {
      const templates = getProblemSpecificTemplates(language)
      if (templates) {
        setCode(templates)
      }
    }
  }, [language])

  const getProblemSpecificTemplates = (lang: string) => {
    const title = problem.title.toLowerCase()
    const description = problem.description.toLowerCase()
    
    if (lang === "java") {
      // Two Sum variations
      if (title.includes('two sum') || title.includes('2sum') || description.includes('two sum')) {
        return `import java.util.*;

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

    public static int[] twoSum(int[] nums, int target) {
        // TODO: Implement the two sum algorithm
        // Given an array of integers nums and an integer target,
        // return indices of the two numbers such that they add up to target.
        // You may assume that each input would have exactly one solution,
        // and you may not use the same element twice.
        // You can return the answer in any order.
        
        // Example 1:
        // Input: nums = [2, 7, 11, 15], target = 9
        // Output: [0, 1]
        // Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
        
        return new int[]{};
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        int[] nums1 = {2, 7, 11, 15};
        int target1 = 9;
        int[] result1 = twoSum(nums1, target1);
        System.out.println("Test 1: " + arrayToString(result1));
        
        int[] nums2 = {3, 2, 4};
        int target2 = 6;
        int[] result2 = twoSum(nums2, target2);
        System.out.println("Test 2: " + arrayToString(result2));
    }
}`
      }
      
      // Palindrome variations
      if (title.includes('palindrome') || description.includes('palindrome')) {
        return `import java.util.*;

public class Solution {
    public static boolean isPalindrome(String s) {
        // TODO: Implement palindrome check
        // A phrase is a palindrome if, after converting all uppercase letters into lowercase letters
        // and removing all non-alphanumeric characters, it reads the same forward and backward.
        // Alphanumeric characters include letters and numbers.
        // Given a string s, return true if it is a palindrome, or false otherwise.
        
        // Example 1:
        // Input: s = "A man, a plan, a canal: Panama"
        // Output: true
        // Explanation: "amanaplanacanalpanama" is a palindrome.
        
        return false;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        String test1 = "A man, a plan, a canal: Panama";
        System.out.println("Test 1: " + isPalindrome(test1));
        
        String test2 = "race a car";
        System.out.println("Test 2: " + isPalindrome(test2));
    }
}`
      }
      
      // Fibonacci variations
      if (title.includes('fibonacci') || title.includes('fib') || description.includes('fibonacci')) {
        return `import java.util.*;

public class Solution {
    public static int fibonacci(int n) {
        // TODO: Implement fibonacci calculation
        // The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence,
        // such that each number is the sum of the two preceding ones, starting from 0 and 1.
        // That is, F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2) for n > 1.
        // Given n, calculate F(n).
        
        // Example 1:
        // Input: n = 2
        // Output: 1
        // Explanation: F(2) = F(1) + F(0) = 1 + 0 = 1.
        
        return 0;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        System.out.println("Test 1: F(0) = " + fibonacci(0));
        System.out.println("Test 2: F(1) = " + fibonacci(1));
        System.out.println("Test 3: F(5) = " + fibonacci(5));
        System.out.println("Test 4: F(10) = " + fibonacci(10));
    }
}`
      }
      
      // Array sorting problems
      if (title.includes('array') || title.includes('sort') || description.includes('array') || description.includes('sort')) {
        return `import java.util.*;

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

    public static int[] sortArray(int[] nums) {
        // TODO: Implement array sorting algorithm
        // Given an array of integers nums, sort the array in ascending order and return it.
        // You must solve the problem without using any built-in sort functions.
        
        // Example 1:
        // Input: nums = [5, 2, 3, 1]
        // Output: [1, 2, 3, 5]
        
        return new int[]{};
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        int[] nums1 = {5, 2, 3, 1};
        int[] result1 = sortArray(nums1);
        System.out.println("Test 1: " + arrayToString(result1));
        
        int[] nums2 = {5, 1, 1, 2, 0, 0};
        int[] result2 = sortArray(nums2);
        System.out.println("Test 2: " + arrayToString(result2));
    }
}`
      }
      
      // String problems
      if (title.includes('string') || title.includes('reverse') || description.includes('string') || description.includes('reverse')) {
        return `import java.util.*;

public class Solution {
    public static String reverseString(String s) {
        // TODO: Implement string reversal
        // Write a function that reverses a string. The input string is given as an array of characters s.
        // You must do this by modifying the input array in-place with O(1) extra memory.
        
        // Example 1:
        // Input: s = "hello"
        // Output: "olleh"
        
        return "";
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        String test1 = "hello";
        System.out.println("Test 1: " + reverseString(test1));
        
        String test2 = "Hannah";
        System.out.println("Test 2: " + reverseString(test2));
    }
}`
      }
      
      // Math problems
      if (title.includes('math') || title.includes('prime') || title.includes('factor') || description.includes('math') || description.includes('prime')) {
        return `import java.util.*;

public class Solution {
    public static boolean isPrime(int n) {
        // TODO: Implement prime number check
        // Given an integer n, return true if n is a prime number, and false otherwise.
        // A prime number is a natural number greater than 1 that is not a product of two smaller natural numbers.
        
        // Example 1:
        // Input: n = 2
        // Output: true
        // Explanation: 2 is a prime number.
        
        return false;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        System.out.println("Test 1: isPrime(2) = " + isPrime(2));
        System.out.println("Test 2: isPrime(4) = " + isPrime(4));
        System.out.println("Test 3: isPrime(17) = " + isPrime(17));
    }
}`
      }
      
      // Tree/Graph problems
      if (title.includes('tree') || title.includes('graph') || title.includes('node') || description.includes('tree') || description.includes('graph')) {
        return `import java.util.*;

public class Solution {
    // Definition for a binary tree node.
    public class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;
        TreeNode() {}
        TreeNode(int val) { this.val = val; }
        TreeNode(int val, TreeNode left, TreeNode right) {
            this.val = val;
            this.left = left;
            this.right = right;
        }
    }
    
    public static int maxDepth(TreeNode root) {
        // TODO: Implement maximum depth calculation
        // Given the root of a binary tree, return its maximum depth.
        // A binary tree's maximum depth is the number of nodes along the longest path
        // from the root node down to the farthest leaf node.
        
        // Example 1:
        // Input: root = [3,9,20,null,null,15,7]
        // Output: 3
        
        return 0;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        // Note: You'll need to create tree structures for testing
        System.out.println("Test 1: maxDepth(null) = " + maxDepth(null));
    }
}`
      }
      
      // Dynamic Programming problems
      if (title.includes('dp') || title.includes('dynamic') || title.includes('memo') || description.includes('dynamic programming')) {
        return `import java.util.*;

public class Solution {
    public static int climbStairs(int n) {
        // TODO: Implement climbing stairs solution
        // You are climbing a staircase. It takes n steps to reach the top.
        // Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?
        
        // Example 1:
        // Input: n = 2
        // Output: 2
        // Explanation: There are two ways to climb to the top.
        // 1. 1 step + 1 step
        // 2. 2 steps
        
        return 0;
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        System.out.println("Test 1: climbStairs(2) = " + climbStairs(2));
        System.out.println("Test 2: climbStairs(3) = " + climbStairs(3));
        System.out.println("Test 3: climbStairs(4) = " + climbStairs(4));
    }
}`
      }
      
      // Default Java template
      return `import java.util.*;

public class Solution {
    public static String solve(String input) {
        // TODO: Implement your solution here
        // Problem: ${problem.title}
        // 
        // ${problem.description}
        // 
        // Return the expected output based on the problem description.
        // Make sure to handle edge cases and validate your input.
        
        return "";
    }
    
    // Main method for testing
    public static void main(String[] args) {
        // Test cases
        String test1 = "test input";
        System.out.println("Test 1: " + solve(test1));
    }
}`
    }
    
    // Python templates
    if (lang === "python") {
      if (title.includes('two sum') || title.includes('2sum') || description.includes('two sum')) {
        return `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # TODO: Implement the two sum algorithm
        # Given an array of integers nums and an integer target,
        # return indices of the two numbers such that they add up to target.
        
        return []
    
    # Test cases
    def test(self):
        solution = Solution()
        nums1 = [2, 7, 11, 15]
        target1 = 9
        result1 = solution.twoSum(nums1, target1)
        print(f"Test 1: {result1}")
        
        nums2 = [3, 2, 4]
        target2 = 6
        result2 = solution.twoSum(nums2, target2)
        print(f"Test 2: {result2}")

if __name__ == "__main__":
    solution = Solution()
    solution.test()`
      }
      
      return `# TODO: Implement your solution here
# Problem: ${problem.title}
# 
# ${problem.description}

class Solution:
    def solve(self, input_str: str) -> str:
        # Your solution here
        return ""

# Test cases
if __name__ == "__main__":
    solution = Solution()
    test_input = "test input"
    result = solution.solve(test_input)
    print(f"Result: {result}")`
    }
    
    // C++ templates
    if (lang === "cpp") {
      if (title.includes('two sum') || title.includes('2sum') || description.includes('two sum')) {
        return `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // TODO: Implement the two sum algorithm
        // Given an array of integers nums and an integer target,
        // return indices of the two numbers such that they add up to target.
        
        return {};
    }
    
    // Test cases
    void test() {
        vector<int> nums1 = {2, 7, 11, 15};
        int target1 = 9;
        vector<int> result1 = twoSum(nums1, target1);
        cout << "Test 1: [";
        for (int i = 0; i < result1.size(); i++) {
            cout << result1[i];
            if (i < result1.size() - 1) cout << ", ";
        }
        cout << "]" << endl;
    }
};

int main() {
    Solution solution;
    solution.test();
    return 0;
}`
      }
      
      return `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    string solve(string input) {
        // TODO: Implement your solution here
        // Problem: ${problem.title}
        // 
        // ${problem.description}
        
        return "";
    }
    
    void test() {
        string test_input = "test input";
        string result = solve(test_input);
        cout << "Result: " << result << endl;
    }
};

int main() {
    Solution solution;
    solution.test();
    return 0;
}`
    }
    
    // JavaScript templates
    if (lang === "javascript") {
      if (title.includes('two sum') || title.includes('2sum') || description.includes('two sum')) {
        return `class Solution {
    twoSum(nums, target) {
        // TODO: Implement the two sum algorithm
        // Given an array of integers nums and an integer target,
        // return indices of the two numbers such that they add up to target.
        
        return [];
    }
    
    // Test cases
    test() {
        const nums1 = [2, 7, 11, 15];
        const target1 = 9;
        const result1 = this.twoSum(nums1, target1);
        console.log("Test 1:", result1);
        
        const nums2 = [3, 2, 4];
        const target2 = 6;
        const result2 = this.twoSum(nums2, target2);
        console.log("Test 2:", result2);
    }
}

// Run tests
const solution = new Solution();
solution.test();`
      }
      
      return `// TODO: Implement your solution here
// Problem: ${problem.title}
// 
// ${problem.description}

class Solution {
    solve(input) {
        // Your solution here
        return "";
    }
    
    test() {
        const testInput = "test input";
        const result = this.solve(testInput);
        console.log("Result:", result);
    }
}

// Run tests
const solution = new Solution();
solution.test();`
    }
    
    return null
  }

  const getTemplateType = () => {
    const title = problem.title.toLowerCase()
    const description = problem.description.toLowerCase()
    
    if (title.includes('two sum') || title.includes('2sum') || description.includes('two sum')) return "Two Sum Algorithm"
    if (title.includes('palindrome') || description.includes('palindrome')) return "Palindrome Check"
    if (title.includes('fibonacci') || title.includes('fib') || description.includes('fibonacci')) return "Fibonacci Sequence"
    if (title.includes('array') || title.includes('sort') || description.includes('array') || description.includes('sort')) return "Array Sorting"
    if (title.includes('string') || title.includes('reverse') || description.includes('string') || description.includes('reverse')) return "String Manipulation"
    if (title.includes('math') || title.includes('prime') || description.includes('math') || description.includes('prime')) return "Mathematical Algorithm"
    if (title.includes('tree') || title.includes('graph') || description.includes('tree') || description.includes('graph')) return "Tree/Graph Traversal"
    if (title.includes('dp') || title.includes('dynamic') || description.includes('dynamic programming')) return "Dynamic Programming"
    
    return "Custom Problem"
  }

  const getFunctionSignature = () => {
    const title = problem.title.toLowerCase()
    const description = problem.description.toLowerCase()
    
    if (title.includes('two sum') || title.includes('2sum') || description.includes('two sum')) return "twoSum(int[] nums, int target)"
    if (title.includes('palindrome') || description.includes('palindrome')) return "isPalindrome(String s)"
    if (title.includes('fibonacci') || title.includes('fib') || description.includes('fibonacci')) return "fibonacci(int n)"
    if (title.includes('array') || title.includes('sort') || description.includes('array') || description.includes('sort')) return "sortArray(int[] nums)"
    if (title.includes('string') || title.includes('reverse') || description.includes('string') || description.includes('reverse')) return "reverseString(String s)"
    if (title.includes('math') || title.includes('prime') || description.includes('math') || description.includes('prime')) return "isPrime(int n)"
    if (title.includes('tree') || title.includes('graph') || description.includes('tree') || description.includes('graph')) return "maxDepth(TreeNode root)"
    if (title.includes('dp') || title.includes('dynamic') || description.includes('dynamic programming')) return "climbStairs(int n)"
    
    return "solve(String input)"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusBadge = () => {
    switch (status) {
      case "solved":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Solved</Badge>
      case "attempted":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Attempted</Badge>
      default:
        return <Badge variant="outline">Not Attempted</Badge>
    }
  }

  const getDifficultyBadge = () => {
    const difficultyLevel = problem.difficulty_level
    if (!difficultyLevel) return null

    const colors: Record<number, string> = {
      1: "bg-green-500/10 text-green-700 border-green-500/20",
      2: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", 
      3: "bg-red-500/10 text-red-700 border-red-500/20",
    }

    const difficultyNames: Record<number, string> = {
      1: "Beginner",
      2: "Intermediate", 
      3: "Advanced"
    }

    return (
      <Badge className={colors[difficultyLevel] || "bg-[var(--muted)]/10 text-[var(--foreground)] border-[var(--border)]/20"}>
        {difficultyNames[difficultyLevel] || "Unknown"}
      </Badge>
    )
  }

  const runCustomTest = async () => {
    if (!code.trim() || !customInput.trim()) return

    setIsRunning(true)
    setCustomOutput("")

    try {
      const result = await TestingService.executeCode(
        code,
        language,
        customInput,
        problem.time_limit,
        problem.memory_limit,
      )

      if (result.success) {
        setCustomOutput(result.output || "")
      } else {
        setCustomOutput(`Error: ${result.error}`)
      }
    } catch (error) {
      setCustomOutput("Error: Failed to execute code")
    } finally {
      setIsRunning(false)
    }
  }

  const runSampleTests = async () => {
    if (!code.trim()) return

    setIsRunning(true)
    setTestResults([])

    try {
      const sampleTests = problem.test_cases.filter((tc) => tc.is_sample)
      const results = await TestingService.runSampleTests(
        code,
        language,
        sampleTests,
        problem.time_limit,
        problem.memory_limit,
      )

      setTestResults(results)
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const submitSolution = async () => {
    if (!code.trim()) return

    setIsSubmitting(true)
    setSubmissionResult(null)

    try {
      const result = await TestingService.submitSolution(problem.id, code, language, userId)

      setSubmissionResult(result)
      setIsTimerRunning(false)

      // Show detailed results for failed submissions
      if (result.status !== "accepted" && result.testResults) {
        setTestResults(result.testResults)
      }
    } catch (error) {
      console.error("Error submitting solution:", error)
      setSubmissionResult({
        status: "error",
        score: 0,
        executionTime: 0,
        memoryUsed: 0,
        testCasesPassed: 0,
        totalTestCases: 0,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Enhanced Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="hover-lift">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-3 py-1 rounded-lg">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTime(timeElapsed)}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={editorTheme} onValueChange={setEditorTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vs-dark">Dark</SelectItem>
                  <SelectItem value="vs-light">Light</SelectItem>
                </SelectContent>
              </Select>
              {getDifficultyBadge()}
              {getStatusBadge()}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          {/* Enhanced Problem Panel */}
          <div className="space-y-6 overflow-y-auto">
            <Card className="card-modern hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3 text-[var(--foreground)]">{problem.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 bg-[var(--primary)]/10 px-3 py-1 rounded-lg">
                        <Trophy className="h-4 w-4 text-[var(--primary)]" />
                        <span className="text-[var(--primary)] font-medium">{problem.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[var(--muted)]/50 px-3 py-1 rounded-lg">
                        <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="text-[var(--muted-foreground)]">{problem.time_limit / 1000}s</span>
                      </div>
                      <div className="flex items-center gap-1 bg-[var(--muted)]/50 px-3 py-1 rounded-lg">
                        <Target className="h-4 w-4 text-[var(--muted-foreground)]" />
                        <span className="text-[var(--muted-foreground)]">{problem.memory_limit} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-[var(--foreground)] whitespace-pre-wrap mb-6 leading-relaxed">{problem.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="p-4 bg-[var(--muted)]/30 rounded-xl">
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Input Format</h4>
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{problem.input_format}</p>
                    </div>
                    <div className="p-4 bg-[var(--muted)]/30 rounded-xl">
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Output Format</h4>
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{problem.output_format}</p>
                    </div>
                  </div>

                  {problem.constraints && (
                    <div className="mb-6 p-4 bg-[var(--warning)]/10 rounded-xl">
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Constraints</h4>
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{problem.constraints}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Sample Input</h4>
                      <pre className="bg-[var(--muted)]/50 p-4 rounded-xl text-sm overflow-x-auto border border-[var(--border)]">
                        <code className="text-[var(--foreground)]">{problem.sample_input}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Sample Output</h4>
                      <pre className="bg-[var(--muted)]/50 p-4 rounded-xl text-sm overflow-x-auto border border-[var(--border)]">
                        <code className="text-[var(--foreground)]">{problem.sample_output}</code>
                      </pre>
                    </div>
                  </div>

                  {problem.explanation && (
                    <div className="mt-6 p-4 bg-[var(--accent)]/10 rounded-xl">
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Explanation</h4>
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">{problem.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Java IDE */}
          <div className="space-y-4">
            <UnifiedJavaIDE
              problemId={problem.id}
              userId={userId}
              problemTitle={problem.title}
              problemDescription={problem.description}
              testCases={problem.test_cases}
              templateCode={getProblemSpecificTemplates(language)}
              onExecutionComplete={(result) => {
                console.log('Execution completed:', result);
                // You can add additional logic here if needed
              }}
            />

            {/* Enhanced Submit Panel */}
            <Card className="card-modern">
              <CardContent className="p-6">
                <Button
                  onClick={submitSolution}
                  disabled={isSubmitting || !code.trim()}
                  className="w-full btn-primary hover-glow text-[var(--primary-foreground)]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Solution"}
                </Button>

                {submissionResult && (
                  <Card className="card-modern mt-6 border-2 border-[var(--border)]">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-2 rounded-full ${
                          submissionResult.status === "accepted" ? 'bg-[var(--success)]/10' : 
                          submissionResult.status === "error" ? 'bg-[var(--destructive)]/10' : 
                          'bg-[var(--destructive)]/10'
                        }`}>
                          {submissionResult.status === "accepted" ? (
                            <CheckCircle className="h-6 w-6 text-[var(--success)]" />
                          ) : submissionResult.status === "error" ? (
                            <AlertCircle className="h-6 w-6 text-[var(--destructive)]" />
                          ) : (
                            <XCircle className="h-6 w-6 text-[var(--destructive)]" />
                          )}
                        </div>
                        <span className={`font-semibold text-lg ${TestingService.getStatusColor(submissionResult.status)}`}>
                          {TestingService.getStatusMessage(submissionResult.status)}
                        </span>
                      </div>

                      {submissionResult.status !== "error" && (
                        <div className="grid grid-cols-2 gap-4 text-sm p-4 bg-[var(--muted)]/30 rounded-xl">
                          <div className="font-medium text-[var(--foreground)]">Score: {submissionResult.score}/100</div>
                          <div className="font-medium text-[var(--foreground)]">Time: {submissionResult.executionTime}ms</div>
                          <div className="font-medium text-[var(--foreground)]">Memory: {Math.round(submissionResult.memoryUsed / 1024)}KB</div>
                          <div className="font-medium text-[var(--foreground)]">
                            Tests: {submissionResult.testCasesPassed}/{submissionResult.totalTestCases}
                          </div>
                        </div>
                      )}

                      {submissionResult.testResults && submissionResult.testResults.length > 0 && (
                        <div className="mt-4 p-4 bg-[var(--muted)]/30 rounded-xl">
                          <h4 className="text-sm font-semibold mb-3 text-[var(--foreground)]">Test Results:</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {submissionResult.testResults.map((result: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-xs">
                                {result.passed ? (
                                  <CheckCircle className="h-3 w-3 text-[var(--success)]" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-[var(--destructive)]" />
                                )}
                                <span className="text-[var(--foreground)]">Test {index + 1}</span>
                                <span className="text-[var(--muted-foreground)]">{result.executionTime}ms</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
