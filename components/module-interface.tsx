"use client";

import React, { useState, useEffect, useMemo, useCallback, memo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Play, RotateCcw, Zap, Clock } from 'lucide-react';
import CodeEditor from '@/components/code-editor';
import { WebExecutionEditor } from '@/components/web-execution-editor';
import { supabase } from '@/lib/supabase/client';
import { LoadingSpinner, Skeleton, ContentLoader } from '@/components/ui/loading-spinner';

interface Question {
  id: string;
  title: string;
  description: string;
  question_text: string;
  question_types: { name: string };
  points: number;
  order_index: number;
  concept_tags?: string[];
  difficulty_level?: number;
  time_limit_seconds?: number;
  max_attempts?: number;
  supports_web_execution?: boolean;
  web_execution_template?: string;
  expected_function_signature?: string;
  question_options?: QuestionOption[];
  explanation?: string; // Added for full explanation
}

interface QuestionOption {
  id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

interface PathModule {
  id: string;
  name: string;
  description: string;
  order_index: number;
  learning_path_id: string;
}

interface ModuleInterfaceProps {
  moduleId: string;
  userId: string;
}

// Lazy load heavy components
const LazyCodeEditor = React.lazy(() => import('@/components/code-editor'));
const LazyWebExecutionEditor = React.lazy(() => import('@/components/web-execution-editor'));

// Memoized question display component
const QuestionDisplay = memo(({ question, onAnswerSelect, selectedAnswer }: {
  question: Question;
  onAnswerSelect: (answerId: string) => void;
  selectedAnswer: string;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-smoky-black">{question.title}</h3>
      <p className="text-dim-gray">{question.question_text}</p>
      {question.description && (
        <p className="text-sm text-dim-gray">{question.description}</p>
      )}
    </div>
    
    {question.question_types.name === 'multiple_choice' && question.question_options && (
      <div className="space-y-2">
        {question.question_options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-2 p-3 border border-slate-gray/20 rounded-lg cursor-pointer hover:bg-slate-gray/5 transition-colors bg-white"
          >
            <input
              type="radio"
              name="answer"
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={() => onAnswerSelect(option.id)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedAnswer === option.id 
                ? 'border-ut-orange bg-ut-orange' 
                : 'border-slate-gray/30'
            }`}>
              {selectedAnswer === option.id && (
                <div className="w-2 h-2 rounded-full bg-smoky-black" />
              )}
            </div>
            <span className="flex-1 text-smoky-black">{option.option_text}</span>
          </label>
        ))}
      </div>
    )}
  </div>
));

QuestionDisplay.displayName = 'QuestionDisplay';

export default function ModuleInterface({ moduleId, userId }: ModuleInterfaceProps) {
  const [module, setModule] = useState<PathModule | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  // Memoized calculations
  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [currentQuestionIndex, questions.length]);

  const totalScoreCalc = useMemo(() => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  }, [questions]);

  // Helper functions
  const randomizeOptions = useCallback((options: QuestionOption[]) => {
    return [...options].sort(() => Math.random() - 0.5);
  }, []);

  const getUniqueOptions = useCallback((question: Question) => {
    if (!question.question_options) return [];
    const correctOption = question.question_options.find(opt => opt.is_correct);
    const incorrectOptions = question.question_options.filter(opt => !opt.is_correct);
    
    if (!correctOption) return question.question_options;
    
    // Get 3 random incorrect options
    const randomIncorrect = incorrectOptions.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [correctOption, ...randomIncorrect];
    
    return randomizeOptions(allOptions);
  }, [randomizeOptions]);

  const getCorrectAnswer = useCallback((question: Question) => {
    return question.question_options?.find(opt => opt.is_correct)?.id || '';
  }, []);

  const getCorrectAnswerText = useCallback((question: Question) => {
    return question.question_options?.find(opt => opt.is_correct)?.option_text || '';
  }, []);

  const generateFullExplanation = useCallback((question: Question, userAnswer: string) => {
    const correctAnswer = getCorrectAnswer(question);
    const isCorrect = userAnswer === correctAnswer;
    
    let explanation = question.explanation || '';
    
    if (!explanation) {
      explanation = isCorrect 
        ? `Correct! You selected the right answer.`
        : `Incorrect. The correct answer is: ${getCorrectAnswerText(question)}`;
    }
    
    return explanation;
  }, [getCorrectAnswer, getCorrectAnswerText]);

  const moveToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
    } else {
      setShowResults(true);
    }
  }, [currentQuestionIndex, questions.length]);

  // Fetch module and questions
  const fetchModuleAndQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch module details
      const { data: moduleData, error: moduleError } = await supabase
        .from('path_modules')
        .select('*')
        .eq('id', moduleId)
        .single();

      if (moduleError) {
        console.error('Error fetching module:', moduleError);
        setError('Failed to load module');
        return;
      }

      setModule(moduleData);

      // Fetch questions for this module
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          question_types (name),
          question_options (*)
        `)
        .eq('path_module_id', moduleId)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        setError('Failed to load questions');
        return;
      }

      // Randomize options for each question
      const questionsWithRandomizedOptions = questionsData.map(q => ({
        ...q,
        question_options: q.question_options ? randomizeOptions(q.question_options) : []
      }));

      setQuestions(questionsWithRandomizedOptions);
      setTotalScore(questionsWithRandomizedOptions.reduce((sum, q) => sum + q.points, 0));
    } catch (error) {
      console.error('Error in fetchModuleAndQuestions:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [moduleId, randomizeOptions]);

  useEffect(() => {
    fetchModuleAndQuestions();
  }, [fetchModuleAndQuestions]);

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    setUserAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answerId
    }));
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === getCorrectAnswer(currentQuestion);
    
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    // Save user response to database
    try {
      const { error } = await supabase
        .from('user_question_responses')
        .insert({
          user_id: userId,
          question_id: currentQuestion.id,
          selected_option_id: selectedAnswer,
          is_correct: isCorrect,
          score: isCorrect ? currentQuestion.points : 0,
          answered_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving response:', error);
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Move to next question or show results
    moveToNextQuestion();
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setUserAnswers({});
    setScore(0);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={fetchModuleAndQuestions} className="mt-4 bg-ut-orange hover:bg-ut-orange/90 text-smoky-black">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!module || questions.length === 0) {
    return (
      <div className="min-h-screen bg-ivory p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-smoky-black mb-4">Module Not Found</h1>
          <p className="text-dim-gray">This module doesn't exist or has no questions.</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / totalScoreCalc) * 100);
    
    return (
      <div className="min-h-screen bg-ivory p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="card-ut">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-smoky-black mb-4">Module Complete!</CardTitle>
              <div className="space-y-4">
                <div className="text-6xl font-bold text-ut-orange">{percentage}%</div>
                <div className="text-xl text-dim-gray">
                  Score: {score} / {totalScoreCalc} points
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Module
                </Button>
                <Button 
                  asChild
                  className="bg-ut-orange hover:bg-ut-orange/90 text-smoky-black"
                >
                  <a href="/dashboard">Back to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="border-b border-slate-gray/20 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-smoky-black">{module.name}</h1>
              <p className="text-dim-gray">{module.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-dim-gray">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <Progress value={progress} className="h-2 w-32 mt-1" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Question */}
          <Card className="card-ut">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="border-ut-orange/30 text-ut-orange">
                    {currentQuestion.points} pts
                  </Badge>
                  {currentQuestion.difficulty_level && (
                    <Badge variant="outline" className="border-slate-gray/30 text-slate-gray">
                      Level {currentQuestion.difficulty_level}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-dim-gray">
                  {currentQuestion.time_limit_seconds && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      {currentQuestion.time_limit_seconds}s
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionDisplay
                question={currentQuestion}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswer={selectedAnswer}
              />
            </CardContent>
          </Card>

          {/* Web Execution Editor (if supported) */}
          {currentQuestion.supports_web_execution && (
            <Card className="card-ut">
              <CardHeader>
                <CardTitle className="text-lg text-smoky-black">Code Editor</CardTitle>
                <p className="text-sm text-dim-gray">
                  Write and test your code here. Make sure your function matches the expected signature.
                </p>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<ContentLoader lines={10} />}>
                  <LazyWebExecutionEditor
                    questionId={currentQuestion.id}
                    userId={userId}
                    questionTitle={currentQuestion.title}
                    questionDescription={currentQuestion.description}
                    templateCode={currentQuestion.web_execution_template || ''}
                    expectedSignature={currentQuestion.expected_function_signature || ''}
                    testCases={[]}
                    onExecutionComplete={() => {}}
                  />
                </Suspense>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={handleAnswerSubmit}
              disabled={!selectedAnswer}
              className="bg-ut-orange hover:bg-ut-orange/90 text-smoky-black"
            >
              {isLastQuestion ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finish Module
                </>
              ) : (
                <>
                  Next Question
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
