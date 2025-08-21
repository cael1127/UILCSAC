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
import CodeEditor from "./code-editor"
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
  categories?: { name: string; color: string }
  difficulty_levels?: { name: string; level: number; color: string }
  user_progress?: Array<{ status: string; best_score: number; attempts: number }>
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

  const userProgress = problem.user_progress?.[0]
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
    public int[] twoSum(int[] nums, int target) {
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
        Solution solution = new Solution();
        
        // Test cases
        int[] nums1 = {2, 7, 11, 15};
        int target1 = 9;
        int[] result1 = solution.twoSum(nums1, target1);
        System.out.println("Test 1: " + Arrays.toString(result1));
        
        int[] nums2 = {3, 2, 4};
        int target2 = 6;
        int[] result2 = solution.twoSum(nums2, target2);
        System.out.println("Test 2: " + Arrays.toString(result2));
    }
}`
      }
      
      // Palindrome variations
      if (title.includes('palindrome') || description.includes('palindrome')) {
        return `import java.util.*;

public class Solution {
    public boolean isPalindrome(String s) {
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
        Solution solution = new Solution();
        
        // Test cases
        String test1 = "A man, a plan, a canal: Panama";
        System.out.println("Test 1: " + solution.isPalindrome(test1));
        
        String test2 = "race a car";
        System.out.println("Test 2: " + solution.isPalindrome(test2));
    }
}`
      }
      
      // Fibonacci variations
      if (title.includes('fibonacci') || title.includes('fib') || description.includes('fibonacci')) {
        return `import java.util.*;

public class Solution {
    public int fibonacci(int n) {
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
        Solution solution = new Solution();
        
        // Test cases
        System.out.println("Test 1: F(0) = " + solution.fibonacci(0));
        System.out.println("Test 2: F(1) = " + solution.fibonacci(1));
        System.out.println("Test 3: F(5) = " + solution.fibonacci(5));
        System.out.println("Test 4: F(10) = " + solution.fibonacci(10));
    }
}`
      }
      
      // Array sorting problems
      if (title.includes('array') || title.includes('sort') || description.includes('array') || description.includes('sort')) {
        return `import java.util.*;

public class Solution {
    public int[] sortArray(int[] nums) {
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
        Solution solution = new Solution();
        
        // Test cases
        int[] nums1 = {5, 2, 3, 1};
        int[] result1 = solution.sortArray(nums1);
        System.out.println("Test 1: " + Arrays.toString(result1));
        
        int[] nums2 = {5, 1, 1, 2, 0, 0};
        int[] result2 = solution.sortArray(nums2);
        System.out.println("Test 2: " + Arrays.toString(result2));
    }
}`
      }
      
      // String problems
      if (title.includes('string') || title.includes('reverse') || description.includes('string') || description.includes('reverse')) {
        return `import java.util.*;

public class Solution {
    public String reverseString(String s) {
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
        Solution solution = new Solution();
        
        // Test cases
        String test1 = "hello";
        System.out.println("Test 1: " + solution.reverseString(test1));
        
        String test2 = "Hannah";
        System.out.println("Test 2: " + solution.reverseString(test2));
    }
}`
      }
      
      // Math problems
      if (title.includes('math') || title.includes('prime') || title.includes('factor') || description.includes('math') || description.includes('prime')) {
        return `import java.util.*;

public class Solution {
    public boolean isPrime(int n) {
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
        Solution solution = new Solution();
        
        // Test cases
        System.out.println("Test 1: isPrime(2) = " + solution.isPrime(2));
        System.out.println("Test 2: isPrime(4) = " + solution.isPrime(4));
        System.out.println("Test 3: isPrime(17) = " + solution.isPrime(17));
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
    
    public int maxDepth(TreeNode root) {
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
        Solution solution = new Solution();
        
        // Test cases
        // Note: You'll need to create tree structures for testing
        System.out.println("Test 1: maxDepth(null) = " + solution.maxDepth(null));
    }
}`
      }
      
      // Dynamic Programming problems
      if (title.includes('dp') || title.includes('dynamic') || title.includes('memo') || description.includes('dynamic programming')) {
        return `import java.util.*;

public class Solution {
    public int climbStairs(int n) {
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
        Solution solution = new Solution();
        
        // Test cases
        System.out.println("Test 1: climbStairs(2) = " + solution.climbStairs(2));
        System.out.println("Test 2: climbStairs(3) = " + solution.climbStairs(3));
        System.out.println("Test 3: climbStairs(4) = " + solution.climbStairs(4));
    }
}`
      }
      
      // Default Java template
      return `import java.util.*;

public class Solution {
    public String solve(String input) {
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
        Solution solution = new Solution();
        
        // Test cases
        String test1 = "test input";
        System.out.println("Test 1: " + solution.solve(test1));
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
    if (!problem.difficulty_levels) return null

    const colors: Record<string, string> = {
      Beginner: "bg-green-500/10 text-green-700 border-green-500/20",
      Easy: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      Hard: "bg-red-500/10 text-red-700 border-red-500/20",
      Expert: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    }

    return (
      <Badge className={colors[problem.difficulty_levels.name] || "bg-gray-500/10 text-gray-700 border-gray-500/20"}>
        {problem.difficulty_levels.name}
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/problems/${problem.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Problem
                </Link>
              </Button>
              <div className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTime(timeElapsed)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
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
          {/* Problem Panel */}
          <div className="space-y-4 overflow-y-auto">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{problem.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{problem.points} pts</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{problem.time_limit / 1000}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>{problem.memory_limit} MB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap mb-4">{problem.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Input Format</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.input_format}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Output Format</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.output_format}</p>
                    </div>
                  </div>

                  {problem.constraints && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Constraints</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.constraints}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Sample Input</h4>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                        <code>{problem.sample_input}</code>
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Sample Output</h4>
                      <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                        <code>{problem.sample_output}</code>
                      </pre>
                    </div>
                  </div>

                  {problem.explanation && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-foreground mb-2">Explanation</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Panel */}
          <div className="space-y-4">
            <Card className="border-border flex-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Solution</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Template:</strong> {getTemplateType()} • 
                      <strong>Function:</strong> {getFunctionSignature()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          const template = getProblemSpecificTemplates(language)
                          if (template) setCode(template)
                        }}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Load Template
                      </Button>
                      <Button
                        onClick={() => setCode("")}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Instructions:</strong> Implement the required function that returns the correct answer. 
                      Your code will be tested against multiple test cases. Make sure to handle edge cases properly.
                    </p>
                  </div>
                </div>
                <CodeEditor value={code} onChange={setCode} language={language} height="400px" theme={editorTheme} />
              </CardContent>
            </Card>

            {/* Test Panel */}
            <Card className="border-border">
              <CardContent className="p-4">
                <Tabs defaultValue="custom" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="custom">Custom Test</TabsTrigger>
                    <TabsTrigger value="sample">Sample Tests</TabsTrigger>
                    <TabsTrigger value="submit">Submit</TabsTrigger>
                  </TabsList>

                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Custom Input</label>
                      <Textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter your test input..."
                        className="min-h-[80px] font-mono text-sm bg-input border-border"
                      />
                    </div>
                    <Button onClick={runCustomTest} disabled={isRunning || !code.trim() || !customInput.trim()}>
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? "Running..." : "Run Test"}
                    </Button>
                    {customOutput && (
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Output</label>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto max-h-40">
                          <code>{customOutput}</code>
                        </pre>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sample" className="space-y-4">
                    <Button onClick={runSampleTests} disabled={isRunning || !code.trim()}>
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? "Running..." : "Run Sample Tests"}
                    </Button>
                    {testResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {testResults.map((result, index) => (
                          <div key={index} className="border border-border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              {result.passed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm font-medium">
                                Test Case {index + 1}: {result.passed ? "Passed" : "Failed"}
                              </span>
                              <div className="ml-auto text-xs text-muted-foreground">
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
                                      <strong>Expected:</strong> {result.expected}
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

                  <TabsContent value="submit" className="space-y-4">
                    <Button
                      onClick={submitSolution}
                      disabled={isSubmitting || !code.trim()}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Submit Solution"}
                    </Button>

                    {submissionResult && (
                      <Card className="border-border">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            {submissionResult.status === "accepted" ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : submissionResult.status === "error" ? (
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <span className={`font-medium ${TestingService.getStatusColor(submissionResult.status)}`}>
                              {TestingService.getStatusMessage(submissionResult.status)}
                            </span>
                          </div>

                          {submissionResult.status !== "error" && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>Score: {submissionResult.score}/100</div>
                              <div>Time: {submissionResult.executionTime}ms</div>
                              <div>Memory: {Math.round(submissionResult.memoryUsed / 1024)}KB</div>
                              <div>
                                Tests: {submissionResult.testCasesPassed}/{submissionResult.totalTestCases}
                              </div>
                            </div>
                          )}

                          {submissionResult.testResults && submissionResult.testResults.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Test Results:</h4>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {submissionResult.testResults.map((result: any, index: number) => (
                                  <div key={index} className="flex items-center gap-2 text-xs">
                                    {result.passed ? (
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                    ) : (
                                      <XCircle className="h-3 w-3 text-red-500" />
                                    )}
                                    <span>Test {index + 1}</span>
                                    <span className="text-muted-foreground">{result.executionTime}ms</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
