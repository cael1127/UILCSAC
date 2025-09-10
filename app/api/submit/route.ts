import { type NextRequest, NextResponse } from "next/server"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

interface SubmitRequest {
  problemId: string
  code: string
  language: string
  userId: string
}

interface TestResult {
  passed: boolean
  input: string
  expected: string
  actual: string
  executionTime: number
  memoryUsed: number
  error?: string
}

interface SubmissionResult {
  status: string
  score: number
  executionTime: number
  memoryUsed: number
  testCasesPassed: number
  totalTestCases: number
  testResults: TestResult[]
  submissionId: string
}

export async function POST(request: NextRequest) {
  try {
    const { problemId, code, language, userId }: SubmitRequest = await request.json()

    // Validate input
    if (!problemId || !code || !language || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get problem details and test cases
    const { data: problem, error: problemError } = await supabase
      .from("problems")
      .select(`
        *,
        test_cases (*)
      `)
      .eq("id", problemId)
      .single()

    if (problemError || !problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 })
    }

    // Create submission record
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        problem_id: problemId,
        code,
        language,
        status: "running",
      })
      .select()
      .single()

    if (submissionError) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
    }

    // Run tests
    const testResults = await runAllTests(code, language, problem.test_cases, problem.time_limit, problem.memory_limit)

    // Calculate results
    const passedTests = testResults.filter((result) => result.passed).length
    const totalTests = testResults.length
    const score = Math.round((passedTests / totalTests) * 100)
    const status = passedTests === totalTests ? "accepted" : passedTests > 0 ? "partial" : "wrong_answer"

    const maxExecutionTime = Math.max(...testResults.map((r) => r.executionTime))
    const maxMemoryUsed = Math.max(...testResults.map((r) => r.memoryUsed))

    // Update submission with results
    await supabase
      .from("submissions")
      .update({
        status,
        score,
        execution_time: maxExecutionTime,
        memory_used: maxMemoryUsed,
        test_cases_passed: passedTests,
        total_test_cases: totalTests,
      })
      .eq("id", submission.id)

    // Update user progress
    const { data: existingProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("problem_id", problemId)
      .single()

    const newStatus = status === "accepted" ? "solved" : "attempted"
    const bestScore = Math.max(existingProgress?.best_score || 0, score)
    const attempts = (existingProgress?.attempts || 0) + 1

    await supabase.from("user_progress").upsert({
      user_id: userId,
      problem_id: problemId,
      status: newStatus,
      best_score: bestScore,
      attempts,
      last_attempt_at: new Date().toISOString(),
      ...(newStatus === "solved" &&
        !existingProgress?.solved_at && {
          solved_at: new Date().toISOString(),
        }),
      ...(!existingProgress?.first_attempt_at && {
        first_attempt_at: new Date().toISOString(),
      }),
    })

    const result: SubmissionResult = {
      status,
      score,
      executionTime: maxExecutionTime,
      memoryUsed: maxMemoryUsed,
      testCasesPassed: passedTests,
      totalTestCases: totalTests,
      testResults: testResults.filter((r) => r.input.length < 100), // Only return small test cases
      submissionId: submission.id,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function runAllTests(
  code: string,
  language: string,
  testCases: any[],
  timeLimit: number,
  memoryLimit: number,
): Promise<TestResult[]> {
  const results: TestResult[] = []

  for (const testCase of testCases) {
    try {
      // Execute code with test case input
      const response = await fetch(`${getSiteUrl()}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          input: testCase.input,
          timeLimit,
          memoryLimit,
        }),
      })

      const execution = await response.json()

      if (!execution.success) {
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expected_output,
          actual: "",
          executionTime: execution.executionTime || 0,
          memoryUsed: execution.memoryUsed || 0,
          error: execution.error,
        })
        continue
      }

      // Compare output
      const actualOutput = execution.output?.trim() || ""
      const expectedOutput = testCase.expected_output.trim()
      const passed = actualOutput === expectedOutput

      results.push({
        passed,
        input: testCase.input,
        expected: expectedOutput,
        actual: actualOutput,
        executionTime: execution.executionTime || 0,
        memoryUsed: execution.memoryUsed || 0,
      })
    } catch (error) {
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: "",
        executionTime: 0,
        memoryUsed: 0,
        error: "Execution failed",
      })
    }
  }

  return results
}
