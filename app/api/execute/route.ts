import { type NextRequest, NextResponse } from "next/server"

interface ExecuteRequest {
  code: string
  language: string
  input: string
  timeLimit?: number
  memoryLimit?: number
}

interface ExecuteResponse {
  success: boolean
  output?: string
  error?: string
  executionTime?: number
  memoryUsed?: number
  exitCode?: number
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, input, timeLimit = 2000, memoryLimit = 256 }: ExecuteRequest = await request.json()

    // Validate input
    if (!code || !language) {
      return NextResponse.json({ success: false, error: "Code and language are required" }, { status: 400 })
    }

    // Simulate code execution (in production, this would use a secure execution service)
    const result = await simulateCodeExecution(code, language, input, timeLimit, memoryLimit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Code execution error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

async function simulateCodeExecution(
  code: string,
  language: string,
  input: string,
  timeLimit: number,
  memoryLimit: number,
): Promise<ExecuteResponse> {
  // Simulate execution delay
  const executionTime = Math.floor(Math.random() * 1000) + 100
  await new Promise((resolve) => setTimeout(resolve, Math.min(executionTime, 2000)))

  // Check for common errors in code
  const errors = detectCodeErrors(code, language)
  if (errors.length > 0) {
    return {
      success: false,
      error: errors[0],
      executionTime,
      memoryUsed: Math.floor(Math.random() * 10000),
      exitCode: 1,
    }
  }

  // Simulate different execution scenarios
  const scenario = Math.random()

  if (scenario < 0.1) {
    // Time limit exceeded
    return {
      success: false,
      error: "Time Limit Exceeded",
      executionTime: timeLimit + 100,
      memoryUsed: Math.floor(Math.random() * 50000),
      exitCode: 124,
    }
  } else if (scenario < 0.15) {
    // Memory limit exceeded
    return {
      success: false,
      error: "Memory Limit Exceeded",
      executionTime,
      memoryUsed: memoryLimit * 1024 * 1024 + 1000,
      exitCode: 137,
    }
  } else if (scenario < 0.2) {
    // Runtime error
    return {
      success: false,
      error: "Runtime Error: Division by zero",
      executionTime,
      memoryUsed: Math.floor(Math.random() * 20000),
      exitCode: 1,
    }
  } else {
    // Successful execution
    const output = generateMockOutput(code, language, input)
    return {
      success: true,
      output,
      executionTime,
      memoryUsed: Math.floor(Math.random() * 30000),
      exitCode: 0,
    }
  }
}

function detectCodeErrors(code: string, language: string): string[] {
  const errors: string[] = []

  // Basic syntax error detection
  if (language === "java") {
    if (!code.includes("public static void main")) {
      errors.push("Compilation Error: No main method found")
    }
    if (code.includes("System.out.print") && !code.includes("import java.")) {
      // This is actually fine, but let's simulate some compilation issues
    }
  } else if (language === "python") {
    // Check for basic Python syntax
    if (code.includes("print(") && code.includes("print ")) {
      errors.push("Syntax Error: Mixed print syntax")
    }
  } else if (language === "cpp") {
    if (!code.includes("#include") && code.includes("cout")) {
      errors.push("Compilation Error: 'cout' was not declared in this scope")
    }
  }

  return errors
}

function generateMockOutput(code: string, language: string, input: string): string {
  // Generate realistic output based on common patterns
  const lines = input.trim().split("\n")

  // Simple echo for basic problems
  if (code.includes("Scanner") || code.includes("input()") || code.includes("cin")) {
    // Try to simulate some basic operations
    if (lines.length === 1) {
      const num = Number.parseInt(lines[0])
      if (!isNaN(num)) {
        // Simulate some mathematical operation
        return (num * 2).toString()
      }
    }

    // For more complex inputs, return a reasonable mock
    return lines
      .map((line) => {
        const nums = line
          .split(" ")
          .map((n) => Number.parseInt(n))
          .filter((n) => !isNaN(n))
        if (nums.length === 2) {
          return (nums[0] + nums[1]).toString()
        }
        return line.split("").reverse().join("")
      })
      .join("\n")
  }

  return "Mock output based on input"
}
