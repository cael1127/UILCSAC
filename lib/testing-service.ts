interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
  executionTime?: number
  memoryUsed?: number
}

interface SubmissionResult {
  status: string
  score: number
  executionTime: number
  memoryUsed: number
  testCasesPassed: number
  totalTestCases: number
  testResults?: any[]
  submissionId?: string
}

export class TestingService {
  static async executeCode(
    code: string,
    language: string,
    input: string,
    timeLimit = 2000,
    memoryLimit = 256,
  ): Promise<ExecutionResult> {
    try {
      // Use real Java executor when language is Java; otherwise fall back to mock executor
      if ((language || '').toLowerCase() === 'java') {
        const supaUrlHeader = (process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') || '') : '')) as string
        const supaAnonHeader = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '') : '')) as string

        const webExecResponse = await fetch("/api/web-execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Pass Supabase keys via headers to the API route (optional but helps SSR/Edge)
            ...(supaUrlHeader ? { 'x-supabase-url': supaUrlHeader } : {}),
            ...(supaAnonHeader ? { 'x-supabase-anon-key': supaAnonHeader } : {}),
          },
          body: JSON.stringify({
            code,
            language: 'java',
            // Wrap single input into a test case; executor will run the first input as stdin
            testCases: input ? [{ input, expected: 'custom' }] : [],
          }),
        })

        if (!webExecResponse.ok) {
          throw new Error(`HTTP error! status: ${webExecResponse.status}`)
        }

        const result = await webExecResponse.json()
        // Normalize to TestingService's ExecutionResult shape
        return {
          success: !!result.success,
          output: result.output,
          error: result.error,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsage,
        }
      }

      // Non-Java fallback: mock executor
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          input,
          timeLimit,
          memoryLimit,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Code execution failed:", error)
      return {
        success: false,
        error: "Failed to execute code",
      }
    }
  }

  static async submitSolution(
    problemId: string,
    code: string,
    language: string,
    userId: string,
  ): Promise<SubmissionResult> {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId,
          code,
          language,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Submission failed:", error)
      return {
        status: "error",
        score: 0,
        executionTime: 0,
        memoryUsed: 0,
        testCasesPassed: 0,
        totalTestCases: 0,
      }
    }
  }

  static async runSampleTests(
    code: string,
    language: string,
    sampleTestCases: Array<{ input: string; expected_output: string }>,
    timeLimit = 2000,
    memoryLimit = 256,
  ) {
    const results = []

    for (const testCase of sampleTestCases) {
      const execution = await this.executeCode(code, language, testCase.input, timeLimit, memoryLimit)

      if (!execution.success) {
        results.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expected_output,
          actual: "",
          error: execution.error,
          executionTime: execution.executionTime || 0,
          memoryUsed: execution.memoryUsed || 0,
        })
        continue
      }

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
    }

    return results
  }

  static getStatusMessage(status: string): string {
    const statusMessages: Record<string, string> = {
      accepted: "Accepted! All test cases passed.",
      wrong_answer: "Wrong Answer. Some test cases failed.",
      partial: "Partial Score. Some test cases passed.",
      time_limit_exceeded: "Time Limit Exceeded. Your solution is too slow.",
      memory_limit_exceeded: "Memory Limit Exceeded. Your solution uses too much memory.",
      runtime_error: "Runtime Error. Your code crashed during execution.",
      compilation_error: "Compilation Error. Your code failed to compile.",
      error: "System Error. Please try again.",
    }

    return statusMessages[status] || "Unknown status"
  }

  static getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      accepted: "text-green-600",
      wrong_answer: "text-red-600",
      partial: "text-yellow-600",
      time_limit_exceeded: "text-orange-600",
      memory_limit_exceeded: "text-purple-600",
      runtime_error: "text-red-600",
      compilation_error: "text-red-600",
      error: "text-gray-600",
    }

    return statusColors[status] || "text-gray-600"
  }
}
