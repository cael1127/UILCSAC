"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Trophy } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

interface Question {
  id: string
  title: string
  question_text: string
  explanation: string
  points: number
  order_index: number
  question_type: {
    name: string
  }
}

interface QuestionOption {
  id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

interface ModuleInterfaceProps {
  pathId: string
  moduleId: string
  userId: string
}

export default function ModuleInterface({ pathId, moduleId, userId }: ModuleInterfaceProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [writtenAnswer, setWrittenAnswer] = useState("")
  const [questionOptions, setQuestionOptions] = useState<QuestionOption[]>([])
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [moduleId])

  useEffect(() => {
    if (questions.length > 0) {
      fetchQuestionOptions(questions[currentQuestionIndex].id)
    }
  }, [questions, currentQuestionIndex])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select(`
          *,
          question_type (name)
        `)
        .eq("path_module_id", moduleId)
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (error) {
        console.error("Error fetching questions:", error)
        return
      }

      setQuestions(data || [])
    } catch (error) {
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionOptions = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from("question_options")
        .select("*")
        .eq("question_id", questionId)
        .order("order_index", { ascending: true })

      if (error) {
        console.error("Error fetching question options:", error)
        return
      }

      setQuestionOptions(data || [])
    } catch (error) {
      console.error("Error fetching question options:", error)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!questions[currentQuestionIndex]) return

    const currentQuestion = questions[currentQuestionIndex]
    let isCorrect = false
    let earnedPoints = 0

    if (currentQuestion.question_type.name === "multiple_choice") {
      if (selectedOption) {
        const correctOption = questionOptions.find(opt => opt.is_correct)
        isCorrect = selectedOption === correctOption?.id
        earnedPoints = isCorrect ? currentQuestion.points : 0
      }
    } else if (currentQuestion.question_type.name === "written") {
      // For written questions, we'll just give points for attempting
      // In a real system, you'd want to implement grading logic
      isCorrect = writtenAnswer.trim().length > 0
      earnedPoints = isCorrect ? currentQuestion.points : 0
    }

    // Save user response
    try {
      await supabase
        .from("user_question_responses")
        .insert({
          user_id: userId,
          question_id: currentQuestion.id,
          selected_option_id: selectedOption,
          written_answer: writtenAnswer,
          is_correct: isCorrect,
          score: earnedPoints
        })

      setScore(prev => prev + earnedPoints)
    } catch (error) {
      console.error("Error saving response:", error)
    }

    // Move to next question or complete module
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setWrittenAnswer("")
    } else {
      setCompleted(true)
      // Update module progress
      try {
        await supabase
          .from("user_learning_progress")
          .update({
            completed_modules: 1,
            total_score: score + earnedPoints
          })
          .eq("user_id", userId)
          .eq("learning_path_id", pathId)
      } catch (error) {
        console.error("Error updating progress:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading module...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">No questions available</h3>
        <p className="text-muted-foreground">This module doesn't have any questions yet.</p>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Module Completed!</h2>
        <p className="text-muted-foreground mb-4">Congratulations! You've completed this module.</p>
        <div className="text-lg font-medium text-foreground mb-6">
          Final Score: {score} points
        </div>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Module Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {currentQuestion.question_type.name.replace("_", " ")}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>{currentQuestion.points} pts</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{currentQuestion.question_text}</p>
          </div>

          {/* Multiple Choice Options */}
          {currentQuestion.question_type.name === "multiple_choice" && (
            <div className="space-y-3">
              <h4 className="font-medium">Select the correct answer:</h4>
              {questionOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="answer"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="text-primary"
                  />
                  <span className="text-foreground">{option.option_text}</span>
                </label>
              ))}
            </div>
          )}

          {/* Written Answer */}
          {currentQuestion.question_type.name === "written" && (
            <div className="space-y-3">
              <h4 className="font-medium">Your answer:</h4>
              <textarea
                value={writtenAnswer}
                onChange={(e) => setWrittenAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full min-h-[120px] p-3 border border-border rounded-md bg-input text-foreground resize-none"
              />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleAnswerSubmit}
              disabled={
                (currentQuestion.question_type.name === "multiple_choice" && !selectedOption) ||
                (currentQuestion.question_type.name === "written" && !writtenAnswer.trim())
              }
            >
              {currentQuestionIndex === questions.length - 1 ? "Complete Module" : "Next Question"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score Display */}
      <div className="text-center">
        <div className="text-lg font-medium text-foreground">
          Current Score: {score} points
        </div>
      </div>
    </div>
  )
}
