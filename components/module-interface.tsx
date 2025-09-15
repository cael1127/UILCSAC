"use client";

import React, { useState, useEffect, useMemo, useCallback, memo, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Play, RotateCcw, Zap, Clock, Code } from 'lucide-react';
import { UnifiedJavaIDE } from '@/components/unified-java-ide';
import { supabase } from '@/lib/supabase/client';
import { LoadingSpinner, Skeleton, ContentLoader } from '@/components/ui/loading-spinner';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  correct_answer?: string;
  explanation?: string;
  order_index: number;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  question_options?: QuestionOption[];
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

// Lazy load heavy components only when needed
const LazyUnifiedJavaIDE = React.lazy(() => 
  import('@/components/unified-java-ide').then(module => ({ default: module.UnifiedJavaIDE }))
);

// Memoized question display component
const QuestionDisplay = memo(({ question, onAnswerSelect, selectedAnswer, disabled }: {
  question: Question;
  onAnswerSelect: (answerId: string) => void;
  selectedAnswer: string;
  disabled?: boolean;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{question.question_text}</h3>
    </div>
    
    {question.question_type?.toLowerCase() === 'multiple_choice' && question.question_options && (
      <div className="space-y-2">
        {question.question_options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-2 p-3 border border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--muted)]/5 transition-colors bg-[var(--card)]"
          >
            <input
              type="radio"
              name="answer"
              value={option.id}
              checked={selectedAnswer === option.id}
              onChange={() => onAnswerSelect(option.id)}
              disabled={!!disabled}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              selectedAnswer === option.id 
                ? 'border-[var(--primary)] bg-[var(--primary)]' 
                : 'border-[var(--border)]'
            }`}>
              {selectedAnswer === option.id && (
                <div className="w-2 h-2 rounded-full bg-[var(--primary-foreground)]" />
              )}
            </div>
            <span className={`flex-1 text-[var(--foreground)] ${disabled ? 'opacity-60' : ''}`}>{option.option_text}</span>
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
  const [typedAnswer, setTypedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [lastAnswerExplanation, setLastAnswerExplanation] = useState('');
  const [nextModule, setNextModule] = useState<PathModule | null>(null);

  // Memoized calculations
  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  }, [currentQuestionIndex, questions.length]);

  const totalScoreCalc = useMemo(() => {
    return questions.reduce((sum, q) => sum + q.points, 0);
  }, [questions]);

  // IDE visibility logic
  const shouldShowIDE = false;

  const isMultipleChoice = useMemo(() => {
    if (!questions[currentQuestionIndex] ) return false;
    const currentQuestion = questions[currentQuestionIndex];
    return currentQuestion.question_type === 'multiple_choice';
  }, [questions, currentQuestionIndex]);

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

  // Helpers to show provided code and a sample input for "predict the output" questions
  const extractCodeFromExplanation = useCallback((explanation?: string) => {
    if (!explanation) return null;
    const match = explanation.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  }, []);

  const deriveCodeAndInput = useCallback((question: Question) => {
    const text = (question.question_text || '').toLowerCase();
    const explCode = extractCodeFromExplanation(question.explanation);
    if (explCode) return { code: explCode, input: '' };

    // Fallback templates for common topics used in seeds
    if (text.includes('binary search') || text.includes('sorted array') || text.includes('target; print index')) {
      return {
        code: `import java.util.*;

public class Main {
  static int bs(int[] a, int t){
    int l=0,r=a.length-1; 
    while(l<=r){
      int m=(l+r)>>>1;
      if(a[m]==t) return m;
      if(a[m]<t) l=m+1; else r=m-1;
    }
    return -1;
  }
  public static void main(String[] args){
    Scanner sc=new Scanner(System.in);
    int n=sc.nextInt();
    int[] a=new int[n];
    for(int i=0;i<n;i++) a[i]=sc.nextInt();
    int t=sc.nextInt();
    System.out.println(bs(a,t));
  }
}`,
        input: '5\n1 3 5 7 9\n7'
      };
    }

    if (text.includes('fizz') || text.includes('buzz')) {
      return {
        code: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    for (int i = 1; i <= n; i++) {
      if (i % 15 == 0) System.out.print("FizzBuzz");
      else if (i % 3 == 0) System.out.print("Fizz");
      else if (i % 5 == 0) System.out.print("Buzz");
      else System.out.print(i);
      if (i < n) System.out.print(" ");
    }
  }
}`,
        input: '5'
      };
    }

    if (text.includes('climb') || text.includes('stairs')) {
      return {
        code: `import java.util.*;

public class Main {
  static int f(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
      int c = a + b;
      a = b;
      b = c;
    }
    return b;
  }

  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    System.out.println(f(n));
  }
}`,
        input: '4'
      };
    }

    if (text.includes('two sum')) {
      return {
        code: `import java.util.*;

public class Main {
  static String s(int[] a, int t) {
    Map<Integer, Integer> m = new HashMap<>();
    for (int i = 0; i < a.length; i++) {
      int need = t - a[i];
      if (m.containsKey(need)) return m.get(need) + " " + i;
      m.put(a[i], i);
    }
    return "-1";
  }

  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
    int[] a = new int[n];
    for (int i = 0; i < n; i++) a[i] = sc.nextInt();
    int t = sc.nextInt();
    System.out.println(s(a, t));
  }
}`,
        input: '4\n2 7 11 15\n9'
      };
    }

    if (text.includes('anagram')) {
      return {
        code: `import java.util.*;

public class Main {
  static boolean ok(String s, String t) {
    if (s.length() != t.length()) return false;
    int[] c = new int[26];
    for (int i = 0; i < s.length(); i++) {
      c[s.charAt(i) - 'a']++;
      c[t.charAt(i) - 'a']--;
    }
    for (int x : c) if (x != 0) return false;
    return true;
  }

  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    String s = sc.nextLine().trim();
    String t = sc.nextLine().trim();
    System.out.println(ok(s, t));
  }
}`,
        input: 'anagram\nnagaram'
      };
    }

    // Graph BFS shortest path (common seed wording)
    if ((text.includes('graph') || text.includes('bfs') || text.includes('shortest path')) && text.includes('undirected')) {
      return {
        code: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt(), m = sc.nextInt();
    List<Integer>[] g = new ArrayList[n + 1];
    for (int i = 1; i <= n; i++) g[i] = new ArrayList<>();
    for (int i = 0; i < m; i++) {
      int u = sc.nextInt(), v = sc.nextInt();
      g[u].add(v);
      g[v].add(u);
    }
    int s = sc.nextInt(), t = sc.nextInt();
    int[] dist = new int[n + 1];
    Arrays.fill(dist, -1);
    ArrayDeque<Integer> q = new ArrayDeque<>();
    dist[s] = 0;
    q.add(s);
    while (!q.isEmpty()) {
      int u = q.poll();
      if (u == t) break;
      for (int v : g[u]) if (dist[v] == -1) {
        dist[v] = dist[u] + 1;
        q.add(v);
      }
    }
    System.out.println(dist[t]);
  }
}`,
        input: '4 3\n1 2\n2 3\n3 4\n1 4'
      };
    }

    return { code: '', input: '' };
  }, [extractCodeFromExplanation]);

  const getDefaultJavaTemplate = useCallback((question: Question) => {
    // Generate a basic Java template based on question content
    const questionText = (question.question_text || '').toLowerCase();
    const title = (question.question_text || '').toLowerCase();
    
    if (questionText.includes('array') || questionText.includes('list') || title.includes('array')) {
      return `public class Solution {
    public static int[] solve(int[] input) {
        // Your code here
        // Modify this method to solve the problem
        return input;
    }
    
    public static void main(String[] args) {
        // Test your solution
        int[] testInput = {1, 2, 3, 4, 5};
        int[] result = solve(testInput);
        System.out.println("Result: " + java.util.Arrays.toString(result));
    }
}`;
    }
    
    if (questionText.includes('string') || questionText.includes('text') || title.includes('string')) {
      return `public class Solution {
    public static String solve(String input) {
        // Your code here
        // Modify this method to solve the problem
        return input;
    }
    
    public static void main(String[] args) {
        // Test your solution
        String testInput = "test";
        String result = solve(testInput);
        System.out.println("Result: " + result);
    }
}`;
    }
    
    if (questionText.includes('math') || questionText.includes('calculate') || questionText.includes('sum')) {
      return `public class Solution {
    public static int solve(int input) {
        // Your code here
        // Modify this method to solve the problem
        return input;
    }
    
    public static void main(String[] args) {
        // Test your solution
        int testInput = 10;
        int result = solve(testInput);
        System.out.println("Result: " + result);
    }
}`;
    }
    
    // Default template for any question
    return `public class Solution {
    public static Object solve(Object input) {
        // Your code here
        // Modify this method to solve the problem
        return input;
        }
    
    public static void main(String[] args) {
        // Test your solution
        System.out.println("Implement your solution in the solve method");
        System.out.println("You can modify the input type and return type as needed");
    }
}`;
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

  // Load user's progress for this module
  const loadUserProgress = useCallback(async (learningPathId: string, moduleId: string, questionsList: any[]) => {
    if (!userId || !questionsList || questionsList.length === 0) return;

    try {
      // Check if user has already completed this specific module
      const { data: moduleProgress, error: moduleProgressError } = await supabase
        .from('user_question_responses')
        .select('question_id, points_earned')
        .eq('user_id', userId)
        .in('question_id', questionsList.map(q => q.id));

      if (moduleProgressError) {
        console.error('Error loading module progress:', moduleProgressError);
        return;
      }

      // If all questions in this module have been answered, show results
      if (moduleProgress && moduleProgress.length === questionsList.length) {
        const totalEarned = moduleProgress.reduce((sum, response) => sum + (response.points_earned || 0), 0);
        setShowResults(true);
        setScore(totalEarned);
        console.log('Module already completed, showing results with score:', totalEarned);
      } else {
        console.log('Module not completed yet, showing questions. Answered:', moduleProgress?.length || 0, 'of', questionsList.length);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }, [userId]);

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

      // Fetch the next module
      await fetchNextModule(moduleId, moduleData.learning_path_id);

      // Fetch questions for this module
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          question_options (*)
        `)
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (questionsError) {
        console.error('Error fetching questions:', questionsError);
        setError('Failed to load questions');
        return;
      }

      // Remove placeholder/starter questions defensively (in case DB cleanup not applied yet)
      const filteredQuestions = (questionsData || []).filter((q: any) => {
        const text = (q.question_text || '').toLowerCase();
        const expl = (q.explanation || '').toLowerCase();
        // Remove known placeholder patterns
        if (text.includes('which concept best relates to this module')) return false;
        if (text.includes('complete the code snippet relevant to')) return false;
        if (expl.includes('checks basic understanding of the module topic')) return false;
        if (expl.includes('students should write a minimal correct snippet')) return false;
        // Remove generic MCQ with options A,B,C,D only
        if (q.question_type?.toLowerCase() === 'multiple_choice' && Array.isArray(q.question_options)) {
          const opts = q.question_options.map((o: any) => (o.option_text || '').trim().toLowerCase()).sort();
          const generic = ['a','b','c','d'];
          if (opts.length === 4 && opts.every((v: string, i: number) => v === generic[i])) {
            return false;
          }
        }
        return true;
      });

      // Randomize options for each remaining question
      const questionsWithRandomizedOptions = filteredQuestions.map(q => ({
        ...q,
        question_options: q.question_options ? randomizeOptions(q.question_options) : []
      }));

      setQuestions(questionsWithRandomizedOptions);
      setTotalScore(questionsWithRandomizedOptions.reduce((sum, q) => sum + q.points, 0));

      console.log('Loaded questions for module:', {
        moduleId,
        questionCount: questionsWithRandomizedOptions.length,
        userId,
        learningPathId: moduleData.learning_path_id
      });

      // Load user's progress for this module
      if (userId && moduleData.learning_path_id) {
        await loadUserProgress(moduleData.learning_path_id, moduleId, questionsWithRandomizedOptions);
      }
    } catch (error) {
      console.error('Error in fetchModuleAndQuestions:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [moduleId, randomizeOptions, userId, loadUserProgress]);

  useEffect(() => {
    fetchModuleAndQuestions();
  }, [fetchModuleAndQuestions]);

  const [lockedQuestionIds, setLockedQuestionIds] = useState<Set<string>>(new Set());

  const handleAnswerSelect = (answerId: string) => {
    const qid = questions[currentQuestionIndex]?.id;
    if (!qid) return;
    if (lockedQuestionIds.has(qid)) return; // prevent changes once locked

    setSelectedAnswer(answerId);
    setUserAnswers(prev => ({
      ...prev,
      [qid]: answerId
    }));
  };

  const handleAnswerSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isMC = isMultipleChoice;
    if (isMC && !selectedAnswer) return;
    if (!isMC && !typedAnswer.trim()) return;

    let isCorrect = false;
    if (isMC) {
      isCorrect = selectedAnswer === getCorrectAnswer(currentQuestion);
    } else {
      const expected = (currentQuestion.correct_answer || '').trim();
      isCorrect = typedAnswer.trim() === expected;
    }
    
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    // Save user response to database and lock the question
    try {
      const { error } = await supabase
        .from('user_question_responses')
        .upsert({
          user_id: userId,
          question_id: currentQuestion.id,
          response_text: isMC ? selectedAnswer : typedAnswer.trim(),
          is_correct: isCorrect,
          points_earned: isCorrect ? currentQuestion.points : 0,
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving response:', error);
      }
      setLockedQuestionIds(prev => new Set(prev).add(currentQuestion.id));
    } catch (error) {
      console.error('Error saving response:', error);
    }

    // Show answer feedback
    setLastAnswerCorrect(isCorrect);
    setLastAnswerExplanation(generateFullExplanation(currentQuestion, isMC ? selectedAnswer : typedAnswer.trim()));
    setShowAnswerFeedback(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setTypedAnswer('');
    setUserAnswers({});
    setScore(0);
    setShowResults(false);
    setShowAnswerFeedback(false);
    setLockedQuestionIds(new Set());
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTypedAnswer('');
      setShowAnswerFeedback(false);
    } else {
      // Module completed! Save progress to database
      await saveModuleCompletion();
      setShowResults(true);
    }
  };

  const saveModuleCompletion = async () => {
    if (!userId || !module?.learning_path_id) return;

    try {
      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('learning_path_id', module.learning_path_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current progress:', fetchError);
        return;
      }

      // Calculate new progress
      const newCompletedModules = (currentProgress?.completed_modules || 0) + 1;
      const newTotalScore = (currentProgress?.total_score || 0) + score;

      // Get next module in the learning path
      const { data: nextModule, error: nextModuleError } = await supabase
        .from('path_modules')
        .select('id')
        .eq('learning_path_id', module.learning_path_id)
        .gt('order_index', module.order_index)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      const nextModuleId = nextModule?.id || null;
      const isPathCompleted = !nextModuleId;

      if (currentProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from('user_learning_progress')
          .update({
            current_module_id: nextModuleId,
            completed_modules: newCompletedModules,
            total_score: newTotalScore,
            is_completed: isPathCompleted,
            last_accessed: new Date().toISOString()
          })
          .eq('id', currentProgress.id);

        if (updateError) {
          console.error('Error updating progress:', updateError);
        }
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_learning_progress')
          .insert({
            user_id: userId,
            learning_path_id: module.learning_path_id,
            current_module_id: nextModuleId,
            completed_modules: newCompletedModules,
            total_score: newTotalScore,
            is_completed: isPathCompleted,
            started_at: new Date().toISOString(),
            last_accessed: new Date().toISOString()
          });

        if (insertError) {
          console.error('Error creating progress:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving module completion:', error);
    }
  };

  // Function to fetch the next module
  const fetchNextModule = useCallback(async (currentModuleId: string, learningPathId: string) => {
    try {
      const { data: currentModule, error: currentError } = await supabase
        .from('path_modules')
        .select('order_index')
        .eq('id', currentModuleId)
        .single();

      if (currentError || !currentModule) {
        console.error('Error fetching current module:', currentError);
        return;
      }

      const { data: nextModuleData, error: nextError } = await supabase
        .from('path_modules')
        .select('*')
        .eq('learning_path_id', learningPathId)
        .gt('order_index', currentModule.order_index)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();

      if (nextError) {
        console.log('No next module found:', nextError);
        setNextModule(null);
        return;
      }

      setNextModule(nextModuleData);
    } catch (error) {
      console.error('Error fetching next module:', error);
      setNextModule(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
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
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
                        <Button onClick={fetchModuleAndQuestions} className="mt-4 bg-ut-orange hover:bg-ut-orange/90 text-[var(--primary-foreground)]">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-4">Module Not Found</h1>
          <p className="text-[var(--muted-foreground)]">This module doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-2xl text-[var(--foreground)]">{module.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--muted)]/30 text-[var(--muted-foreground)]">
                This module currently has no questions.
              </div>
              <div className="flex gap-3">
                {nextModule ? (
                  <Button asChild className="btn-primary text-[var(--primary-foreground)]">
                    <a href={`/learning/${module.learning_path_id}/module/${nextModule.id}`}>Go to Next Module</a>
                  </Button>
                ) : (
                  <Button asChild className="btn-primary text-[var(--primary-foreground)]">
                    <a href={`/learning/${module.learning_path_id}`}>Back to Learning Path</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / totalScoreCalc) * 100);
    
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="card-ut">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-[var(--foreground)] mb-4">Module Complete!</CardTitle>
              <div className="space-y-4">
                <div className="text-6xl font-bold text-[var(--primary)]">{percentage}%</div>
                <div className="text-xl text-[var(--muted-foreground)]">
                  Score: {score} / {totalScoreCalc} points
                </div>
                <Progress value={percentage} className="h-3" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={handleRetry}
                  variant="outline"
                  className="border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry Module
                </Button>
                {nextModule ? (
                  <Button 
                    asChild
                    className="bg-[var(--success)] hover:bg-[var(--success)]/90 text-[var(--success-foreground)]"
                  >
                    <a href={`/learning/${module?.learning_path_id}/module/${nextModule.id}`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Next: {nextModule.name.length > 15 ? nextModule.name.substring(0, 15) + '...' : nextModule.name}
                    </a>
                  </Button>
                ) : (
                  <Button 
                    asChild
                    className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
                  >
                    <a href={`/learning/${module?.learning_path_id}`}>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View Learning Path
                    </a>
                  </Button>
                )}
                <Button 
                  asChild
                  className="bg-ut-orange hover:bg-ut-orange/90 text-[var(--primary-foreground)]"
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
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Enhanced Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] shadow-sm backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">{module.name}</h1>
              <p className="text-[var(--muted-foreground)] text-lg">{module.description}</p>
            </div>
            <div className="text-right ml-6">
              <div className="text-sm text-[var(--muted-foreground)] mb-2">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <Progress value={progress} className="h-3 w-40" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* Enhanced Question */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="border-[var(--primary)]/30 text-[var(--primary)] bg-[var(--primary)]/10">
                    {currentQuestion.points} pts
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <QuestionDisplay
                question={currentQuestion}
                onAnswerSelect={handleAnswerSelect}
                selectedAnswer={selectedAnswer}
                disabled={lockedQuestionIds.has(currentQuestion.id)}
              />
            </CardContent>
          </Card>

          {/* Enhanced Answer Feedback */}
          {showAnswerFeedback && (
            <Card className={`card-modern border-2 ${
              lastAnswerCorrect ? 'border-[var(--success)]' : 'border-[var(--destructive)]'
            }`}>
              <CardHeader>
                <CardTitle className={`text-xl flex items-center gap-3 ${
                  lastAnswerCorrect ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
                }`}>
                  <div className={`p-2 rounded-full ${
                    lastAnswerCorrect ? 'bg-[var(--success)]/10' : 'bg-[var(--destructive)]/10'
                  }`}>
                    {lastAnswerCorrect ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  {lastAnswerCorrect ? 'Correct!' : 'Incorrect'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-[var(--muted)]/30 rounded-xl">
                  <h4 className="font-semibold text-[var(--foreground)] mb-3 text-lg">Explanation:</h4>
                  <p className="text-[var(--foreground)] leading-relaxed">{lastAnswerExplanation}</p>
                </div>
                
                <div className="flex justify-end">
                  <Button
                    onClick={handleNextQuestion}
                    className="btn-primary hover-glow text-[var(--primary-foreground)]"
                  >
                    {isLastQuestion ? 'Finish Module' : 'Next Question'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Provided Code + Prediction Answer for non-MC questions */}
          {(() => { const info = deriveCodeAndInput(currentQuestion); const shouldShowPredict = !isMultipleChoice && (!!info.code || !!info.input); return shouldShowPredict ? (
            <Card className="card-modern hover-lift">
              <CardHeader>
                <CardTitle className="text-xl text-[var(--foreground)] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                    <Code className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  Predict the Output
                </CardTitle>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Run the given code mentally or in your own environment and enter the exact output below.
                </p>
              </CardHeader>
              <CardContent>
                {info.code && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-[var(--foreground)] mb-2">Code</div>
                    <pre className="bg-[var(--muted)]/40 p-3 rounded-md overflow-x-auto text-sm whitespace-pre-wrap font-mono text-[var(--foreground)]"><code>{info.code}</code></pre>
                  </div>
                )}
                {info.input && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-[var(--foreground)] mb-2">Sample Input</div>
                    <pre className="bg-[var(--muted)]/40 p-3 rounded-md overflow-x-auto text-sm whitespace-pre-wrap font-mono text-[var(--foreground)]"><code>{info.input}</code></pre>
                  </div>
                )}
                <Textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type the exact output here"
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          ) : null; })()}

          {/* Message for Multiple Choice Questions */}
          {isMultipleChoice && (
            <Card className="card-ut border-dashed border-[var(--border)]">
              <CardContent className="py-6 text-center">
                <div className="text-[var(--muted-foreground)]">
                  <p className="text-sm">This is a multiple choice question. No code editor is needed.</p>
                  <p className="text-xs mt-1">Select an answer above to continue.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message and IDE for Written Problems */}
          {!isMultipleChoice && currentQuestion?.question_type === 'written' && (
            <Card className="card-ut border-dashed border-[var(--border)] bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="py-4 text-center">
                <div className="text-blue-800 dark:text-blue-200">
                  <p className="text-sm font-medium">Written Problem with Java IDE</p>
                  <p className="text-xs mt-1">Use the Java IDE below to write and test your solution.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isMultipleChoice && currentQuestion?.question_type === 'written' && (
            <Suspense fallback={<div className="text-[var(--muted-foreground)]">Loading IDE...</div>}>
              <LazyUnifiedJavaIDE
                questionId={currentQuestion.id}
                userId={userId}
                questionTitle={module?.name}
                questionDescription={currentQuestion.question_text}
                templateCode={getDefaultJavaTemplate(currentQuestion)}
              />
            </Suspense>
          )}

          {/* Enhanced Navigation - Only show when not displaying answer feedback */}
          {!showAnswerFeedback && (
            <div className="flex justify-between gap-4">
              <div />

              <Button
                onClick={handleAnswerSubmit}
                disabled={isMultipleChoice ? !selectedAnswer : !typedAnswer.trim()}
                className="btn-primary hover-glow text-[var(--primary-foreground)]"
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
          )}
        </div>
      </div>
    </div>
  );
}
