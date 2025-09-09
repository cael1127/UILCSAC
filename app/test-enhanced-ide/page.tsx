import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnhancedJavaIDE } from "@/components/enhanced-java-ide"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function TestEnhancedIDEPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Sample test cases for demonstration
  const sampleTestCases = [
    {
      id: "1",
      input: "5",
      expected_output: "10",
      is_sample: true,
      points: 10
    },
    {
      id: "2", 
      input: "10",
      expected_output: "20",
      is_sample: true,
      points: 10
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Enhanced Java IDE Test</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Real Java execution with Supabase backend
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Test the Enhanced Java IDE
          </h2>
          <p className="text-muted-foreground">
            This IDE provides real Java code execution with console output, syntax highlighting, 
            error detection, and performance metrics. Try running some Java code!
          </p>
        </div>

        <EnhancedJavaIDE
          problemId="test-problem"
          userId={user.id}
          problemTitle="Enhanced IDE Test Problem"
          problemDescription="Write a Java program that takes a number as input and returns double that number. Use System.out.println() to print the result."
          testCases={sampleTestCases}
          templateCode={`public class Solution {
    public static void main(String[] args) {
        // Test your solution
        int testInput = 5;
        int result = doubleNumber(testInput);
        
        System.out.println("Input: " + testInput);
        System.out.println("Output: " + result);
    }
    
    public static int doubleNumber(int n) {
        // TODO: Implement this method to return n * 2
        return 0;
    }
}`}
          onExecutionComplete={(result) => {
            console.log('Execution completed:', result);
          }}
        />

        {/* Features showcase */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-foreground mb-2">Real Java Execution</h3>
            <p className="text-sm text-muted-foreground">
              Your code runs on the Supabase backend with actual console output and error handling.
            </p>
          </div>
          
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-foreground mb-2">Enhanced Console</h3>
            <p className="text-sm text-muted-foreground">
              See real-time output from System.out.println() with execution timing and memory usage.
            </p>
          </div>
          
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-foreground mb-2">Smart Templates</h3>
            <p className="text-sm text-muted-foreground">
              Auto-generated code templates based on problem type with proper Java structure.
            </p>
          </div>
          
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-foreground mb-2">Error Detection</h3>
            <p className="text-sm text-muted-foreground">
              Real-time syntax and compilation error detection with helpful suggestions.
            </p>
          </div>
          
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-foreground mb-2">Test Cases</h3>
            <p className="text-sm text-muted-foreground">
              Run against sample test cases to verify your solution before submission.
            </p>
          </div>
          
          <div className="p-4 border border-border rounded-lg bg-card">
            <h3 className="font-semibold text-foreground mb-2">Performance Metrics</h3>
            <p className="text-sm text-muted-foreground">
              Track execution time, memory usage, and variable states during execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
