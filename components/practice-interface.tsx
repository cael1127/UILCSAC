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
      const templates: Record<string, string> = {
        java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Your code here
        
        sc.close();
    }
}`,
        python: `# Your code here
`,
        cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
        javascript: `// Your code here
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    // Process input
});`,
      }

      if (templates[language]) {
        setCode(templates[language])
      }
    }
  }, [language])

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
