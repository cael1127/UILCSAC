"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  Trophy,
  Target,
  AlertTriangle,
  BookOpen,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import EnhancedQuestionRenderer from '@/components/enhanced-question-renderer'
import type { PracticeTest, EnhancedQuestion, UserPracticeTestAttempt } from '@/lib/types/subjects'

interface PracticeTestInterfaceProps {
  testId: string
  userId: string
  className?: string
}

interface TestQuestion extends EnhancedQuestion {
  test_order_index: number
  test_points: number
  options?: Array<{
    id: string
    option_text: string
    is_correct: boolean
    order_index: number
  }>
}

interface UserAnswer {
  questionId: string
  answer: string
  isCorrect: boolean
  timeSpent: number
}

export default function PracticeTestInterface({
  testId,
  userId,
  className = ''
}: PracticeTestInterfaceProps) {
  const router = useRouter()
  const [test, setTest] = useState<PracticeTest | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isTestStarted, setIsTestStarted] = useState(false)
  const [isTestCompleted, setIsTestCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())

  // Load test data
  useEffect(() => {
    loadTestData()
  }, [testId])

  // Timer effect
  useEffect(() => {
    if (isTestStarted && !isTestCompleted && !isPaused && timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            handleTimeUp()
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isTestStarted, isTestCompleted, isPaused, timeRemaining])

  const loadTestData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load test details
      const { data: testData, error: testError } = await supabase
        .from('practice_tests')
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq('id', testId)
        .eq('is_active', true)
        .single()

      if (testError) throw testError
      if (!testData) throw new Error('Test not found')

      setTest(testData)
      setTimeRemaining(testData.time_limit_minutes ? testData.time_limit_minutes * 60 : null)

      // Load test questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('practice_test_questions')
        .select(`
          *,
          question:questions(
            *,
            options:question_options(*)
          )
        `)
        .eq('practice_test_id', testId)
        .order('order_index', { ascending: true })

      if (questionsError) throw questionsError

      const formattedQuestions: TestQuestion[] = questionsData.map(ptq => ({
        ...ptq.question,
        test_order_index: ptq.order_index,
        test_points: ptq.points,
        options: ptq.question.options
      }))

      setQuestions(formattedQuestions)

    } catch (err) {
      console.error('Error loading test data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const startTest = async () => {
    try {
      // Create test attempt record
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_practice_test_attempts')
        .insert({
          user_id: userId,
          practice_test_id: testId,
          started_at: new Date().toISOString(),
          max_possible_score: test?.total_points || 0
        })
        .select()
        .single()

      if (attemptError) throw attemptError

      setAttemptId(attemptData.id)
      setIsTestStarted(true)
      setQuestionStartTime(Date.now())
    } catch (err) {
      console.error('Error starting test:', err)
      setError('Failed to start test')
    }
  }

  const handleAnswer = useCallback((answer: string, isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000)
    
    setUserAnswers(prev => new Map(prev.set(currentQuestion.id, {
      questionId: currentQuestion.id,
      answer,
      isCorrect,
      timeSpent
    })))
  }, [currentQuestionIndex, questions, questionStartTime])

  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index)
      setQuestionStartTime(Date.now())
    }
  }

  const handleTimeUp = async () => {
    await completeTest()
  }

  const completeTest = async () => {
    if (!attemptId || isTestCompleted) return

    try {
      const totalScore = Array.from(userAnswers.values())
        .reduce((sum, answer) => {
          const question = questions.find(q => q.id === answer.questionId)
          return sum + (answer.isCorrect ? (question?.test_points || 1) : 0)
        }, 0)

      const totalTimeSpent = Array.from(userAnswers.values())
        .reduce((sum, answer) => sum + answer.timeSpent, 0)

      // Update attempt record
      const { error: updateError } = await supabase
        .from('user_practice_test_attempts')
        .update({
          completed_at: new Date().toISOString(),
          total_score: totalScore,
          time_taken_seconds: totalTimeSpent,
          is_completed: true
        })
        .eq('id', attemptId)

      if (updateError) throw updateError

      setIsTestCompleted(true)
    } catch (err) {
      console.error('Error completing test:', err)
      setError('Failed to save test results')
    }
  }

  const calculateProgress = () => {
    return Math.round((userAnswers.size / questions.length) * 100)
  }

  const calculateScore = () => {
    const answeredQuestions = Array.from(userAnswers.values())
    if (answeredQuestions.length === 0) return 0
    
    const correctAnswers = answeredQuestions.filter(a => a.isCorrect).length
    return Math.round((correctAnswers / answeredQuestions.length) * 100)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
          <p className="text-[var(--muted-foreground)]">Loading practice test...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <Alert className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Test not found or has no questions.</AlertDescription>
      </Alert>
    )
  }

  // Pre-test screen
  if (!isTestStarted) {
    return (
      <div className={`practice-test-interface ${className}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-[var(--primary)]/10">
                  <Trophy className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{test.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {test.description}
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {test.subject?.display_name}
                </Badge>
                <Badge variant="outline">
                  {test.test_type.replace('_', ' ')}
                </Badge>
                <Badge variant="outline">
                  Level {test.difficulty_level}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Test Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {questions.length}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">Questions</div>
                </div>
                
                <div className="text-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {test.total_points}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">Total Points</div>
                </div>
                
                <div className="text-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {test.time_limit_minutes || 'No'}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {test.time_limit_minutes ? 'Minutes' : 'Time Limit'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--foreground)]">
                    {test.difficulty_level}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">Difficulty</div>
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instructions:</strong>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li>• Answer all questions to the best of your ability</li>
                    <li>• You can navigate between questions using the navigation buttons</li>
                    {test.time_limit_minutes && (
                      <li>• You have {test.time_limit_minutes} minutes to complete this test</li>
                    )}
                    <li>• Your progress is automatically saved</li>
                    <li>• Click "Submit Test" when you're finished</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Start Button */}
              <div className="text-center">
                <Button
                  onClick={startTest}
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start Practice Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Test completion screen
  if (isTestCompleted) {
    const totalCorrect = Array.from(userAnswers.values()).filter(a => a.isCorrect).length
    const totalAnswered = Array.from(userAnswers.values()).length
    const score = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
    
    return (
      <div className={`practice-test-interface ${className}`}>
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 rounded-full bg-[var(--primary)]/10">
                <Trophy className="h-12 w-12 text-[var(--primary)]" />
              </div>
              <CardTitle className="text-3xl">Test Completed!</CardTitle>
              <CardDescription className="text-lg">
                Great job completing the {test.title}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Results Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-4xl font-bold text-[var(--primary)] mb-2">
                    {score}%
                  </div>
                  <div className="text-[var(--muted-foreground)]">Overall Score</div>
                </div>
                
                <div className="text-center p-6 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-4xl font-bold text-[var(--foreground)] mb-2">
                    {totalCorrect}/{totalAnswered}
                  </div>
                  <div className="text-[var(--muted-foreground)]">Correct Answers</div>
                </div>
                
                <div className="text-center p-6 bg-[var(--muted)]/30 rounded-lg">
                  <div className="text-4xl font-bold text-[var(--foreground)] mb-2">
                    {Array.from(userAnswers.values()).reduce((sum, a) => sum + a.timeSpent, 0)}s
                  </div>
                  <div className="text-[var(--muted-foreground)]">Time Taken</div>
                </div>
              </div>

              {/* Performance Feedback */}
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Analysis:</strong>
                  {score >= 90 && " Excellent work! You've mastered this material."}
                  {score >= 80 && score < 90 && " Good job! You have a solid understanding with room for minor improvements."}
                  {score >= 70 && score < 80 && " Not bad! Review the areas you missed and try again."}
                  {score < 70 && " Keep practicing! Focus on the fundamentals and try this test again later."}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                >
                  Back to Dashboard
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Active test screen
  const currentQuestion = questions[currentQuestionIndex]
  const progress = calculateProgress()

  return (
    <div className={`practice-test-interface ${className}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Test Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">{test.title}</h2>
                <Badge variant="secondary">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {timeRemaining !== null && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className={`font-mono ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                )}
                
                <Button
                  onClick={() => setIsPaused(!isPaused)}
                  variant="outline"
                  size="sm"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Progress value={progress} className="mt-4" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {questions.map((_, index) => {
                  const isAnswered = userAnswers.has(questions[index].id)
                  const isCurrent = index === currentQuestionIndex
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => navigateToQuestion(index)}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className={`relative ${
                        isAnswered ? 'bg-green-100 border-green-300' : ''
                      }`}
                    >
                      {index + 1}
                      {isAnswered && (
                        <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-600" />
                      )}
                    </Button>
                  )
                })}
              </div>
              
              <div className="mt-4 text-sm text-[var(--muted-foreground)]">
                <div>Answered: {userAnswers.size}/{questions.length}</div>
                <div>Progress: {progress}%</div>
              </div>
            </CardContent>
          </Card>

          {/* Current Question */}
          <div className="lg:col-span-3 space-y-6">
            {currentQuestion && (
              <EnhancedQuestionRenderer
                question={currentQuestion}
                onAnswer={handleAnswer}
                userAnswer={userAnswers.get(currentQuestion.id)?.answer}
                isAnswered={userAnswers.has(currentQuestion.id)}
                timeRemaining={currentQuestion.time_limit_seconds || undefined}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={completeTest}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
