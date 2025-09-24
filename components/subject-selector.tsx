"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Code, 
  Calculator, 
  Atom, 
  BookOpen, 
  SpellCheck,
  ArrowRight,
  Trophy,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
// import type { Subject, UserSubjectProgress } from '@/lib/types/subjects'

interface Subject {
  id: string
  name: string
  display_name: string
  description: string | null
  icon_name: string | null
  color_theme: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface UserSubjectProgress {
  id: string
  user_id: string
  subject_id: string
  total_learning_paths: number
  completed_learning_paths: number
  total_practice_tests: number
  completed_practice_tests: number
  average_score: number
  time_spent_minutes: number
  last_accessed: string
  created_at: string
  updated_at: string
}

interface SubjectSelectorProps {
  userId: string
  className?: string
}

const SUBJECT_ICONS = {
  'computer_science': Code,
  'mathematics': Calculator,
  'science': Atom,
  'literature': BookOpen,
  'spelling': SpellCheck,
} as const

const SUBJECT_COLORS = {
  'blue': 'from-[var(--primary)]/20 to-[var(--accent)]/30 border-[var(--border)]',
  'green': 'from-[var(--primary)]/20 to-[var(--accent)]/30 border-[var(--border)]',
  'purple': 'from-[var(--primary)]/20 to-[var(--accent)]/30 border-[var(--border)]',
  'orange': 'from-[var(--primary)]/20 to-[var(--accent)]/30 border-[var(--border)]',
  'pink': 'from-[var(--primary)]/20 to-[var(--accent)]/30 border-[var(--border)]',
} as const

const SUBJECT_DESCRIPTIONS = {
  'computer_science': 'Master Java programming, algorithms, and data structures for UIL Computer Science competitions.',
  'mathematics': 'Excel in Number Sense, Calculator Applications, and General Math with mental math techniques.',
  'science': 'Explore Biology, Chemistry, Physics, and Earth Science with comprehensive content and formulas.',
  'literature': 'Analyze literary works, master literary devices, and develop critical thinking skills.',
  'spelling': 'Master spelling patterns, etymology, and vocabulary building for UIL competitions.'
}

export default function SubjectSelector({ userId, className = '' }: SubjectSelectorProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [userProgress, setUserProgress] = useState<UserSubjectProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (subjectsError) {
        console.error('Error loading subjects:', subjectsError)
        return
      }

      setSubjects(subjectsData || [])

      // Load user progress for each subject
      const { data: progressData, error: progressError } = await supabase
        .from('user_subject_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressError) {
        console.error('Error loading progress:', progressError)
        return
      }

      setUserProgress(progressData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSubjectIcon = (subjectName: string) => {
    const IconComponent = SUBJECT_ICONS[subjectName as keyof typeof SUBJECT_ICONS] || BookOpen
    return IconComponent
  }

  const getSubjectProgress = (subjectId: string) => {
    const progress = userProgress.find(p => p.subject_id === subjectId)
    if (!progress || progress.total_learning_paths === 0) return 0
    return Math.round((progress.completed_learning_paths / progress.total_learning_paths) * 100)
  }

  const getSubjectStats = (subjectId: string) => {
    const progress = userProgress.find(p => p.subject_id === subjectId)
    return {
      completedPaths: progress?.completed_learning_paths || 0,
      totalPaths: progress?.total_learning_paths || 0,
      averageScore: Math.round(progress?.average_score || 0),
      timeSpent: Math.round((progress?.time_spent_minutes || 0) / 60),
      lastAccessed: progress?.last_accessed
    }
  }

  const navigateToSubject = (subjectName: string) => {
    router.push(`/dashboard/${subjectName}`)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`subject-selector ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">
          Choose Your UIL Subject
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Select a UIL competition subject to access its dedicated learning environment, practice problems, and progress tracking.
        </p>
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => {
          const IconComponent = getSubjectIcon(subject.name)
          const progress = getSubjectProgress(subject.id)
          const stats = getSubjectStats(subject.id)
          const hasStarted = stats.completedPaths > 0 || stats.timeSpent > 0

          return (
            <Card 
              key={subject.id} 
              className="group hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 border-2"
              onClick={() => navigateToSubject(subject.name)}
            >
              <CardHeader className="pb-4">
                {/* Subject Icon and Header */}
                <div className={`w-full h-32 rounded-xl bg-gradient-to-br ${SUBJECT_COLORS[subject.color_theme as keyof typeof SUBJECT_COLORS]} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                  <IconComponent className="h-16 w-16 text-[var(--primary-foreground)] drop-shadow-lg" />
                </div>
                
                <div className="space-y-2">
                  <CardTitle className="text-2xl group-hover:text-[var(--primary)] transition-colors">
                    {subject.display_name}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {SUBJECT_DESCRIPTIONS[subject.name as keyof typeof SUBJECT_DESCRIPTIONS]}
                  </CardDescription>
                </div>

                {/* Progress Badge */}
                {hasStarted && (
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-sm">
                      {progress}% Complete
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {stats.timeSpent}h studied
                    </Badge>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                {hasStarted && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Progress</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}

                {/* Quick Stats */}
                {hasStarted ? (
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div className="p-3 bg-[var(--muted)]/30 rounded-lg">
                      <div className="font-bold text-[var(--foreground)] text-lg">
                        {stats.completedPaths}
                      </div>
                      <div className="text-[var(--muted-foreground)]">Paths Done</div>
                    </div>
                    <div className="p-3 bg-[var(--muted)]/30 rounded-lg">
                      <div className="font-bold text-[var(--foreground)] text-lg">
                        {stats.averageScore}%
                      </div>
                      <div className="text-[var(--muted-foreground)]">Avg Score</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
                    <p className="text-[var(--muted-foreground)]">
                      Ready to start your journey in {subject.display_name}?
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className="w-full"
                  style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToSubject(subject.name)
                  }}
                >
                  {hasStarted ? (
                    <>
                      Continue Learning
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Start Learning
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Overall Stats */}
      {userProgress.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[var(--foreground)] text-center mb-8">
            Your Overall Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <Trophy className="h-8 w-8 text-[var(--primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--foreground)]">
                {userProgress.reduce((sum, p) => sum + p.completed_learning_paths, 0)}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Total Paths Completed</div>
            </Card>
            
            <Card className="text-center p-6">
              <Target className="h-8 w-8 text-[var(--primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--foreground)]">
                {Math.round(userProgress.reduce((sum, p) => sum + p.average_score, 0) / userProgress.length || 0)}%
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Overall Average</div>
            </Card>
            
            <Card className="text-center p-6">
              <Clock className="h-8 w-8 text-[var(--primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--foreground)]">
                {Math.round(userProgress.reduce((sum, p) => sum + p.time_spent_minutes, 0) / 60)}h
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Time Studied</div>
            </Card>
            
            <Card className="text-center p-6">
              <TrendingUp className="h-8 w-8 text-[var(--primary)] mx-auto mb-2" />
              <div className="text-3xl font-bold text-[var(--foreground)]">
                {userProgress.filter(p => p.completed_learning_paths > 0).length}
              </div>
              <div className="text-sm text-[var(--muted-foreground)]">Active Subjects</div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
