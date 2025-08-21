import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('learning_paths')
      .select('*')
      .limit(1)
    
    if (testError) {
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: testError.message 
      }, { status: 500 })
    }
    
    // Test questions table
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(3)
    
    // Test question options table
    const { data: optionsData, error: optionsError } = await supabase
      .from('question_options')
      .select('*')
      .limit(3)
    
    return NextResponse.json({
      success: true,
      learning_paths: testData?.length || 0,
      questions: questionsData?.length || 0,
      question_options: optionsData?.length || 0,
      sample_question: questionsData?.[0] || null,
      sample_options: optionsData || [],
      errors: {
        questions: questionsError?.message,
        options: optionsError?.message
      }
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
