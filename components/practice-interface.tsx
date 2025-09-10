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
  executionTime: number
  memoryUsage: number
}

export default function PracticeInterface({ problem, userId }: PracticeInterfaceProps) {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("java")
  const [customInput, setCustomInput] = useState("")
  const [customOutput, setCustomOutput] = useState("")
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<string>("not_attempted")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  const [fontSize, setFontSize] = useState(14)

  // Load saved data from localStorage
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
      // Simple, clean templates
      if (title.includes('array') || title.includes('list') || description.includes('array')) {
        return `public class Solution {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        
        // Your solution here
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    System.out.println("[" + i + ", " + j + "]");
                    return;
                }
            }
        }
    }
}`
      }
      
      if (title.includes('string') || title.includes('palindrome') || description.includes('string')) {
        return `public class Solution {
    public static void main(String[] args) {
        String s = "racecar";
        
        // Your solution here
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (s.charAt(left) != s.charAt(right)) {
                System.out.println("false");
                return;
            }
            left++;
            right--;
        }
        System.out.println("true");
    }
}`
      }
      
      if (title.includes('math') || title.includes('calculate') || description.includes('math')) {
        return `public class Solution {
    public static void main(String[] args) {
        int n = 5;
        
        // Your solution here
        int result = 1;
        for (int i = 1; i <= n; i++) {
            result *= i;
        }
        System.out.println(result);
    }
}`
      }
      
      // Default simple template
      return `public class Solution {
    public static void main(String[] args) {
        // Your solution here
        System.out.println("Hello World");
    }
}`
    }
    
    // For other languages, return simple templates
    return `// Your solution here
console.log("Hello World");`
  }

  const getTemplateType = () => {
    const title = problem.title.toLowerCase()
    const description = problem.description.toLowerCase()
    
    if (title.includes('array') || title.includes('list') || description.includes('array') || description.includes('list')) return "Array Problem"
    if (title.includes('string') || title.includes('palindrome') || description.includes('string') || description.includes('palindrome')) return "String Problem"
    if (title.includes('math') || title.includes('prime') || description.includes('math') || description.includes('prime')) return "Mathematical Algorithm"
    if (title.includes('tree') || title.includes('graph') || description.includes('tree') || description.includes('graph')) return "Tree/Graph Traversal"
    if (title.includes('dp') || title.includes('dynamic') || description.includes('dynamic programming')) return "Dynamic Programming"
    
    return "Custom Problem"
  }

  const getFunctionSignature = () => {
    const title = problem.title.toLowerCase()
    const description = problem.description.toLowerCase()
    
    if (title.includes('array') || title.includes('list') || description.includes('array') || description.includes('list')) return "twoSum(int[] nums, int target)"
    if (title.includes('string') || title.includes('palindrome') || description.includes('string') || description.includes('palindrome')) return "isPalindrome(String s)"
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

    const difficultyNames: Record<number, string> = {
      1: "Easy",
      2: "Medium", 
      3: "Hard"
    }

    const colors: Record<number, string> = {
      1: "bg-green-500/10 text-green-700 border-green-500/20",
      2: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      3: "bg-red-500/10 text-red-700 border-red-500/20"
    }

    const level = Number(difficultyLevel)

    return (
      <Badge className={colors[level] || "bg-[var(--muted)]/10 text-[var(--foreground)] border-[var(--border)]/20"}>
        {difficultyNames[level] || "Unknown"}
      </Badge>
    )
  }

  const runCustomTest = async () => {
    if (!code.trim() || !customInput.trim()) return

    setIsRunning(true)
    setCustomOutput("")

    try {
      const result = await TestingService.executeCode(code, language, customInput)
      setCustomOutput(result.output || result.error || "No output")
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
      const sampleTests = problem.test_cases.filter(tc => tc.is_sample)
      const results: TestResult[] = []

      for (const testCase of sampleTests) {
        const result = await TestingService.executeCode(code, language, testCase.input)
        const passed = result.output?.trim() === testCase.expected_output.trim()
        
        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expected_output,
          actual: result.output || result.error || "No output",
          executionTime: result.executionTime || 0,
          memoryUsage: (result as any).memoryUsed || (result as any).memoryUsage || 0
        })
      }

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

    try {
      // Run all test cases
      const allTests = problem.test_cases
      const results: TestResult[] = []

      for (const testCase of allTests) {
        const result = await TestingService.executeCode(code, language, testCase.input)
        const passed = result.output?.trim() === testCase.expected_output.trim()
        
        results.push({
          passed,
          input: testCase.input,
          expected: testCase.expected_output,
          actual: result.output || result.error || "No output",
          executionTime: result.executionTime || 0,
          memoryUsage: (result as any).memoryUsed || (result as any).memoryUsage || 0
        })
      }

      setTestResults(results)
      
      const passedTests = results.filter(r => r.passed).length
      const totalTests = results.length
      
      if (passedTests === totalTests) {
        setStatus("solved")
      } else {
        setStatus("attempted")
      }

      // Optionally save submission (disabled: API method not present)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Enhanced Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-[var(--border)]" />
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-[var(--foreground)]">{problem.title}</h1>
                {getStatusBadge()}
                {getDifficultyBadge()}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-[var(--muted-foreground)]">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-[var(--muted-foreground)]">
                <Trophy className="h-4 w-4" />
                <span>{problem.points} pts</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[var(--foreground)]">Problem Description</CardTitle>
                  <div className="flex items-center space-x-2">
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
                        {problem.sample_input}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Sample Output</h4>
                      <pre className="bg-[var(--muted)]/50 p-4 rounded-xl text-sm overflow-x-auto border border-[var(--border)]">
                        {problem.sample_output}
                      </pre>
                    </div>
                  </div>

                  {problem.explanation && (
                    <div className="mt-6 p-4 bg-[var(--info)]/10 rounded-xl">
                      <h4 className="font-semibold text-[var(--foreground)] mb-3">Explanation</h4>
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{problem.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Code Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-[var(--foreground)]">Code Editor</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UnifiedJavaIDE
                  questionId={problem.id}
                  userId={userId}
                  questionTitle={problem.title}
                  questionDescription={problem.description}
                  templateCode={code || undefined}
                />
              </CardContent>
            </Card>

            {/* Test Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-[var(--foreground)]">Test Your Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="custom" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="custom">Custom Test</TabsTrigger>
                    <TabsTrigger value="sample">Sample Tests</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="custom" className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Input</label>
                      <Textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter test input..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button 
                      onClick={runCustomTest} 
                      disabled={isRunning || !code.trim() || !customInput.trim()}
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {isRunning ? "Running..." : "Run Test"}
                    </Button>
                    {customOutput && (
                      <div>
                        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">Output</label>
                        <pre className="bg-[var(--muted)]/50 p-4 rounded-xl text-sm overflow-x-auto border border-[var(--border)] min-h-[100px]">
                          {customOutput}
                        </pre>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sample" className="space-y-4">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={runSampleTests} 
                        disabled={isRunning || !code.trim()}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {isRunning ? "Running..." : "Run Sample Tests"}
                      </Button>
                      <Button 
                        onClick={submitSolution} 
                        disabled={isSubmitting || !code.trim()}
                        variant="default"
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit Solution"}
                      </Button>
                    </div>
                    
                    {testResults.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[var(--foreground)]">Test Results</h4>
                        {testResults.map((result, index) => (
                          <div key={index} className={`p-4 rounded-xl border ${
                            result.passed 
                              ? "bg-green-500/10 border-green-500/20" 
                              : "bg-red-500/10 border-red-500/20"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {result.passed ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="font-medium text-[var(--foreground)]">
                                  Test Case {index + 1}
                                </span>
                              </div>
                              <Badge variant={result.passed ? "default" : "destructive"}>
                                {result.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium text-[var(--muted-foreground)] mb-1">Input:</div>
                                <pre className="bg-[var(--muted)]/50 p-2 rounded text-xs overflow-x-auto">
                                  {result.input}
                                </pre>
                              </div>
                              <div>
                                <div className="font-medium text-[var(--muted-foreground)] mb-1">Expected:</div>
                                <pre className="bg-[var(--muted)]/50 p-2 rounded text-xs overflow-x-auto">
                                  {result.expected}
                                </pre>
                              </div>
                              <div className="md:col-span-2">
                                <div className="font-medium text-[var(--muted-foreground)] mb-1">Actual:</div>
                                <pre className="bg-[var(--muted)]/50 p-2 rounded text-xs overflow-x-auto">
                                  {result.actual}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
