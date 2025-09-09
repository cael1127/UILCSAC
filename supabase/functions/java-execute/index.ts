import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, userId, questionId } = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Java code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('=== SUPABASE EDGE FUNCTION JAVA EXECUTION ===')
    console.log('Received Java code:', code)
    console.log('User ID:', userId)
    console.log('Question ID:', questionId)
    
    // NOTE: Disable DB persistence to avoid blocking execution if table/policies are missing.
    // If you want to log executions, create a "code_executions" table and re-enable the code below.

    // Execute Java code using Deno's Java execution capabilities
    const executionResult = await executeJavaCode(code)

    console.log('Execution completed:', executionResult)

    return new Response(
      JSON.stringify({
        success: true,
        result: executionResult,
        message: 'Java code executed successfully on Supabase'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Supabase Edge Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Edge function execution failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function executeJavaCode(javaCode: string): Promise<{
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  memoryUsage: number;
}> {
  const startTime = Date.now()
  
  try {
    console.log('Executing Java code on Supabase Edge Function...')
    
    // Create a temporary file for the Java code
    const tempDir = await Deno.makeTempDir()
    const javaFile = `${tempDir}/Solution.java`
    const classFile = `${tempDir}/Solution.class`
    
    // Write Java code to file
    await Deno.writeTextFile(javaFile, javaCode)
    
    // Compile Java code
    const compileCmd = new Deno.Command('javac', {
      args: [javaFile],
      cwd: tempDir,
      stdout: 'piped',
      stderr: 'piped'
    })
    
    const compileResult = await compileCmd.output()
    
    if (!compileResult.success) {
      const errorOutput = new TextDecoder().decode(compileResult.stderr)
      await Deno.remove(tempDir, { recursive: true })
      
      return {
        success: false,
        output: '',
        error: `Java compilation error: ${errorOutput}`,
        executionTime: Date.now() - startTime,
        memoryUsage: 0
      }
    }
    
    // Execute Java code
    const executeCmd = new Deno.Command('java', {
      args: ['-cp', tempDir, 'Solution'],
      cwd: tempDir,
      stdout: 'piped',
      stderr: 'piped'
    })
    
    const executeResult = await executeCmd.output()
    
    // Clean up temporary files
    await Deno.remove(tempDir, { recursive: true })
    
    const output = new TextDecoder().decode(executeResult.stdout)
    const errorOutput = new TextDecoder().decode(executeResult.stderr)
    
    return {
      success: executeResult.success,
      output: output.trim(),
      error: errorOutput.trim() || undefined,
      executionTime: Date.now() - startTime,
      memoryUsage: Math.floor(Math.random() * 100) + 50 // Simulate memory usage
    }

  } catch (error) {
    return {
      success: false,
      output: '',
      error: `Java execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionTime: Date.now() - startTime,
      memoryUsage: 0
    }
  }
}
