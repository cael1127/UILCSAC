"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Calculator,
  Volume2,
  BookOpen,
  Code
} from 'lucide-react'

// Import our specialized tools
import MathRenderer, { MathJaxProvider, MixedContentRenderer, ChemistryRenderer, PhysicsEquation } from '@/components/tools/math-renderer'
import AudioPlayer, { SpellingDictation, PronunciationPractice } from '@/components/tools/audio-player'
import TextAnalyzer, { PoetryAnalyzer } from '@/components/tools/text-analyzer'
import { UnifiedJavaIDE } from '@/components/unified-java-ide'

import type { EnhancedQuestion, QuestionType, MediaType } from '@/lib/types/subjects'

interface QuestionOption {
  id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

interface EnhancedQuestionRendererProps {
  question: EnhancedQuestion & {
    options?: QuestionOption[]
  }
  onAnswer: (answer: string, isCorrect: boolean) => void
  showExplanation?: boolean
  userAnswer?: string
  isAnswered?: boolean
  timeRemaining?: number
  className?: string
}

export default function EnhancedQuestionRenderer({
  question,
  onAnswer,
  showExplanation = false,
  userAnswer,
  isAnswered = false,
  timeRemaining,
  className = ''
}: EnhancedQuestionRendererProps) {
  const [currentAnswer, setCurrentAnswer] = useState(userAnswer || '')
  const [timeLeft, setTimeLeft] = useState(timeRemaining)
  const [hasSubmitted, setHasSubmitted] = useState(isAnswered)

  // Timer effect
  useEffect(() => {
    if (timeLeft && timeLeft > 0 && !hasSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            // Auto-submit when time runs out
            handleSubmit()
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft, hasSubmitted])

  const handleSubmit = () => {
    if (hasSubmitted) return

    let isCorrect = false
    
    switch (question.question_type) {
      case 'multiple_choice':
        const correctOption = question.options?.find(opt => opt.is_correct)
        isCorrect = currentAnswer === correctOption?.option_text
        break
      
      case 'short_answer':
      case 'calculation':
        // Normalize answers for comparison
        const normalizedAnswer = currentAnswer.trim().toLowerCase()
        const normalizedCorrect = question.correct_answer?.trim().toLowerCase() || ''
        isCorrect = normalizedAnswer === normalizedCorrect
        break
      
      case 'true_false':
        isCorrect = currentAnswer.toLowerCase() === question.correct_answer?.toLowerCase()
        break
      
      default:
        // For other types, just check if answer matches
        isCorrect = currentAnswer.trim() === question.correct_answer?.trim()
    }

    setHasSubmitted(true)
    onAnswer(currentAnswer, isCorrect)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderQuestionContent = () => {
    const content = question.question_text

    // Handle different media types
    switch (question.media_type) {
      case 'latex':
        return (
          <MathJaxProvider>
            <MixedContentRenderer content={content} className="text-lg" />
          </MathJaxProvider>
        )
      
      case 'image':
        return (
          <div className="space-y-4">
            <div className="text-lg">{content}</div>
            {question.media_url && (
              <img 
                src={question.media_url} 
                alt="Question image"
                className="max-w-full h-auto rounded-lg border"
              />
            )}
          </div>
        )
      
      case 'audio':
        return (
          <div className="space-y-4">
            <div className="text-lg">{content}</div>
            {question.media_url && (
              <AudioPlayer
                audioUrl={question.media_url}
                showControls={true}
              />
            )}
          </div>
        )
      
      default:
        return <div className="text-lg">{content}</div>
    }
  }

  const renderAnswerInput = () => {
    if (hasSubmitted && !showExplanation) {
      return null
    }

    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={setCurrentAnswer}
            disabled={hasSubmitted}
            className="space-y-3"
          >
            {question.options?.sort((a, b) => a.order_index - b.order_index).map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.option_text} id={option.id} />
                <Label 
                  htmlFor={option.id} 
                  className={`flex-1 cursor-pointer p-2 rounded ${
                    hasSubmitted && option.is_correct 
                      ? 'bg-green-100 text-green-800' 
                      : hasSubmitted && currentAnswer === option.option_text && !option.is_correct
                      ? 'bg-red-100 text-red-800'
                      : ''
                  }`}
                >
                  {question.media_type === 'latex' ? (
                    <MathJaxProvider>
                      <MixedContentRenderer content={option.option_text} />
                    </MathJaxProvider>
                  ) : (
                    option.option_text
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'true_false':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={setCurrentAnswer}
            disabled={hasSubmitted}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        )

      case 'short_answer':
      case 'calculation':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={hasSubmitted}
            placeholder="Enter your answer..."
            className="text-lg w-full p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          />
        )

      case 'essay':
      case 'written_response':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={hasSubmitted}
            placeholder="Write your response..."
            className="min-h-[120px] w-full p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          />
        )

      case 'dictation':
        return (
          <div className="space-y-4">
            {question.media_url && (
              <SpellingDictation
                word={question.correct_answer || ''}
                audioUrl={question.media_url}
                showWord={hasSubmitted}
              />
            )}
            <Input
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={hasSubmitted}
              placeholder="Spell the word you heard..."
              className="text-lg text-center w-full p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            />
          </div>
        )

      case 'code_completion':
        return (
          <div className="space-y-4">
            <UnifiedJavaIDE
              questionId={question.id}
              userId="current-user" // This should come from props
              questionTitle="Code Completion"
              questionDescription={question.question_text}
              templateCode={question.media_metadata?.initialCode || '// Write your code here'}
            />
          </div>
        )

      case 'text_analysis':
        return (
          <div className="space-y-4">
            {question.media_metadata?.passage && (
              <TextAnalyzer
                passage={question.media_metadata.passage}
                title={question.media_metadata.title}
                author={question.media_metadata.author}
                genre={question.media_metadata.genre}
                showAnalysisTools={!hasSubmitted}
              />
            )}
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={hasSubmitted}
              placeholder="Write your analysis..."
              className="min-h-[120px] w-full p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            />
          </div>
        )

      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={hasSubmitted}
            placeholder="Enter your answer..."
            className="text-lg w-full p-3 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          />
        )
    }
  }

  const getQuestionTypeIcon = () => {
    switch (question.question_type) {
      case 'calculation':
      case 'formula_derivation':
        return <Calculator className="h-5 w-5" />
      case 'dictation':
        return <Volume2 className="h-5 w-5" />
      case 'text_analysis':
      case 'essay':
        return <BookOpen className="h-5 w-5" />
      case 'code_completion':
        return <Code className="h-5 w-5" />
      default:
        return <Lightbulb className="h-5 w-5" />
    }
  }

  const getDifficultyColor = () => {
    switch (question.difficulty_level) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      case 5: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`enhanced-question-renderer ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getQuestionTypeIcon()}
            <CardTitle className="text-xl">
              Question {question.order_index}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor()}>
              Level {question.difficulty_level}
            </Badge>
            <Badge variant="outline">
              {question.points} point{question.points !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        
        {/* Timer */}
        {timeLeft && timeLeft > 0 && !hasSubmitted && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Time remaining: {formatTime(timeLeft)}</span>
            <Progress 
              value={(timeLeft / (question.time_limit_seconds || 60)) * 100} 
              className="flex-1 h-2"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Content */}
        <div className="question-content">
          {renderQuestionContent()}
        </div>

        {/* Answer Input */}
        <div className="answer-section">
          {renderAnswerInput()}
        </div>

        {/* Submit Button */}
        {!hasSubmitted && (
          <Button 
            onClick={handleSubmit}
            disabled={!currentAnswer.trim()}
            className="w-full"
            size="lg"
          >
            Submit Answer
          </Button>
        )}

        {/* Result Display */}
        {hasSubmitted && (
          <div className="result-section">
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              currentAnswer.trim() === question.correct_answer?.trim()
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {currentAnswer.trim() === question.correct_answer?.trim() ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="font-medium">
                {currentAnswer.trim() === question.correct_answer?.trim() 
                  ? 'Correct!' 
                  : 'Incorrect'
                }
              </span>
              {currentAnswer.trim() !== question.correct_answer?.trim() && (
                <span className="ml-2">
                  Correct answer: {question.correct_answer}
                </span>
              )}
            </div>

            {/* Explanation */}
            {showExplanation && question.explanation && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Explanation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {question.media_type === 'latex' ? (
                    <MathJaxProvider>
                      <MixedContentRenderer content={question.explanation} />
                    </MathJaxProvider>
                  ) : (
                    <p className="text-[var(--foreground)]">{question.explanation}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
