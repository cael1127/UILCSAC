"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Lightbulb,
  Calculator,
  Volume2,
  BookOpen,
  Code,
  Save
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

interface PracticeTestQuestionRendererProps {
  question: EnhancedQuestion & {
    options?: QuestionOption[]
  }
  onAnswerChange: (answer: string) => void
  userAnswer?: string
  timeRemaining?: number
  className?: string
}

export default function PracticeTestQuestionRenderer({
  question,
  onAnswerChange,
  userAnswer,
  timeRemaining,
  className = ''
}: PracticeTestQuestionRendererProps) {
  const [currentAnswer, setCurrentAnswer] = useState(userAnswer || '')
  const [timeLeft, setTimeLeft] = useState(timeRemaining)

  // Update local answer when userAnswer prop changes
  useEffect(() => {
    setCurrentAnswer(userAnswer || '')
  }, [userAnswer])

  // Timer effect (optional - only if question has individual time limit)
  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            return 0
          }
          return prev ? prev - 1 : 0
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeLeft])

  const handleAnswerChange = (newAnswer: string) => {
    setCurrentAnswer(newAnswer)
    onAnswerChange(newAnswer)
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
      
      case 'chemistry':
        return (
          <MathJaxProvider>
            <ChemistryRenderer formula={content} className="text-lg" />
          </MathJaxProvider>
        )
      
      case 'physics':
        return (
          <MathJaxProvider>
            <PhysicsEquation equation={content} className="text-lg" />
          </MathJaxProvider>
        )
      
      default:
        return (
          <div className="prose prose-lg max-w-none">
            <p className="text-[var(--foreground)] whitespace-pre-wrap">{content}</p>
          </div>
        )
    }
  }

  const renderAnswerInput = () => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.option_text} 
                  id={`option-${option.id}`}
                />
                <Label 
                  htmlFor={`option-${option.id}`}
                  className="text-[var(--foreground)] cursor-pointer"
                >
                  {option.option_text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'short_answer':
      case 'calculation':
        return (
          <Input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
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
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Write your response here..."
            className="min-h-[200px] w-full"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          />
        )

      case 'true_false':
        return (
          <RadioGroup
            value={currentAnswer}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="text-[var(--foreground)] cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="text-[var(--foreground)] cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        )

      case 'code_completion':
        return (
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <UnifiedJavaIDE
              templateCode={question.question_text}
              onCodeChange={handleAnswerChange}
              initialCode={currentAnswer}
              height="400px"
            />
          </div>
        )

      case 'dictation':
        return (
          <div className="space-y-4">
            <AudioPlayer 
              src={question.media_url || ''} 
              autoPlay={false}
            />
            <Input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type what you hear..."
              className="w-full"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            />
          </div>
        )

      case 'text_analysis':
        return (
          <div className="space-y-4">
            <TextAnalyzer 
              text={question.question_text}
              onAnalysisChange={handleAnswerChange}
              initialAnalysis={currentAnswer}
            />
          </div>
        )

      default:
        return (
          <Input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          />
        )
    }
  }

  const getQuestionIcon = () => {
    switch (question.question_type) {
      case 'multiple_choice': return <BookOpen className="h-5 w-5" />
      case 'short_answer': return <BookOpen className="h-5 w-5" />
      case 'calculation': return <Calculator className="h-5 w-5" />
      case 'code_completion': return <Code className="h-5 w-5" />
      case 'essay': return <BookOpen className="h-5 w-5" />
      case 'dictation': return <Volume2 className="h-5 w-5" />
      case 'text_analysis': return <BookOpen className="h-5 w-5" />
      default: return <BookOpen className="h-5 w-5" />
    }
  }

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-yellow-100 text-yellow-800'
      case 3: return 'bg-orange-100 text-orange-800'
      case 4: return 'bg-red-100 text-red-800'
      case 5: return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={`practice-test-question ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
              {getQuestionIcon()}
            </div>
            <div>
              <CardTitle className="text-lg text-[var(--foreground)]">
                Question {question.test_order_index || 1}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={getDifficultyColor(question.difficulty_level)}>
                  Level {question.difficulty_level}
                </Badge>
                <Badge variant="outline">
                  {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                </Badge>
                {question.question_type && (
                  <Badge variant="secondary">
                    {question.question_type.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {timeLeft && timeLeft > 0 && (
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Clock className="h-4 w-4" />
              <span className={timeLeft < 60 ? 'text-red-500' : ''}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Content */}
        <div className="prose prose-lg max-w-none">
          {renderQuestionContent()}
        </div>

        {/* Answer Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-[var(--foreground)]">Your Answer:</h4>
            {currentAnswer && (
              <div className="flex items-center gap-1 text-green-600">
                <Save className="h-4 w-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
          </div>
          {renderAnswerInput()}
        </div>

        {/* Hints/Additional Info */}
        {question.explanation && (
          <div className="bg-[var(--muted)]/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-[var(--primary)] mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-[var(--foreground)] mb-2">Hint</h5>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
