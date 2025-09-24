"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Code, 
  Calculator, 
  Atom, 
  BookOpen, 
  SpellCheck,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Play,
  ChevronRight,
  Star
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import type { Subject, UserSubjectProgress, SubjectStats } from "@/lib/types/subjects"

interface MultiSubjectDashboardProps {
  userId: string
}

const SUBJECT_ICONS = {
  'computer_science': Code,
  'mathematics': Calculator,
  'science': Atom,
  'literature': BookOpen,
  'spelling': SpellCheck,
} as const

const SUBJECT_COLORS = {
  'blue': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'green': 'bg-green-500/10 text-green-700 border-green-200',
  'purple': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'orange': 'bg-orange-500/10 text-orange-700 border-orange-200',
  'pink': 'bg-pink-500/10 text-pink-700 border-pink-200',
} as const

export default function MultiSubjectDashboard({ userId }: MultiSubjectDashboardProps) {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [userId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all active subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (subjectsError) {
        console.error("Error fetching subjects:", subjectsError)
        return
      }

      setSubjects(subjectsData || [])

      // Fetch user progress for each subject
      const { data: progressData, error: progressError } = await supabase
        .from("user_subject_progress")
        .select(`
          *,
          subject:subjects(*)
        `)
        .eq("user_id", userId)

      if (progressError) {
        console.error("Error fetching user progress:", progressError)
        return
      }

      // Create subject stats combining subjects and progress
      const stats: SubjectStats[] = subjectsData.map(subject => {
        const progress = progressData?.find(p => p.subject_id === subject.id)
        
        return {
          subject,
          progress: progress || {
            id: '',
            user_id: userId,
            subject_id: subject.id,
            total_learning_paths: 0,
            completed_learning_paths: 0,
            total_practice_tests: 0,
            completed_practice_tests: 0,
            average_score: 0,
            time_spent_minutes: 0,
            last_accessed: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          recentActivity: {
            learning_paths: 0,
            practice_tests: 0,
            questions_answered: 0,
          },
          achievements: {
            completed_paths: progress?.completed_learning_paths || 0,
            perfect_scores: 0,
            streak_days: 0,
          }
        }
      })

      setSubjectStats(stats)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSubjectIcon = (subjectName: string) => {
    const IconComponent = SUBJECT_ICONS[subjectName as keyof typeof SUBJECT_ICONS] || BookOpen
    return IconComponent
  }

  const getSubjectColorClass = (colorTheme: string) => {
    return SUBJECT_COLORS[colorTheme as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.blue
  }

  const calculateOverallProgress = (stats: SubjectStats) => {
    const { progress } = stats
    if (progress.total_learning_paths === 0) return 0
    return Math.round((progress.completed_learning_paths / progress.total_learning_paths) * 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[var(--foreground)]">
          UIL Academy Dashboard
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-3xl mx-auto">
          Master all UIL subjects with comprehensive learning paths, practice tests, and progress tracking
        </p>
      </div>

      {/* Subject Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectStats.map((stats) => {
          const IconComponent = getSubjectIcon(stats.subject.name)
          const progress = calculateOverallProgress(stats)
          
          return (
            <Card key={stats.subject.id} className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${getSubjectColorClass(stats.subject.color_theme)}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {progress}% Complete
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-[var(--primary)] transition-colors">
                  {stats.subject.display_name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {stats.subject.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-[var(--muted)]/30 rounded-lg">
                    <div className="font-semibold text-[var(--foreground)]">
                      {stats.progress.completed_learning_paths}
                    </div>
                    <div className="text-[var(--muted-foreground)]">Paths Done</div>
                  </div>
                  <div className="text-center p-2 bg-[var(--muted)]/30 rounded-lg">
                    <div className="font-semibold text-[var(--foreground)]">
                      {Math.round(stats.progress.average_score)}%
                    </div>
                    <div className="text-[var(--muted-foreground)]">Avg Score</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    asChild 
                    className="flex-1" 
                    variant={progress > 0 ? "default" : "outline"}
                  >
                    <Link href={`/learning?subject=${stats.subject.name}`}>
                      {progress > 0 ? "Continue" : "Start Learning"}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/practice?subject=${stats.subject.name}`}>
                      <Play className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center p-6">
          <Trophy className="h-8 w-8 text-[var(--primary)] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {subjectStats.reduce((sum, stats) => sum + stats.achievements.completed_paths, 0)}
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">Paths Completed</div>
        </Card>
        
        <Card className="text-center p-6">
          <Target className="h-8 w-8 text-[var(--accent)] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {Math.round(subjectStats.reduce((sum, stats) => sum + stats.progress.average_score, 0) / subjectStats.length || 0)}%
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">Overall Average</div>
        </Card>
        
        <Card className="text-center p-6">
          <Clock className="h-8 w-8 text-[var(--warning)] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {Math.round(subjectStats.reduce((sum, stats) => sum + stats.progress.time_spent_minutes, 0) / 60)}h
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">Time Studied</div>
        </Card>
        
        <Card className="text-center p-6">
          <TrendingUp className="h-8 w-8 text-[var(--success)] mx-auto mb-2" />
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {subjectStats.filter(stats => calculateOverallProgress(stats) > 0).length}
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">Active Subjects</div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[var(--primary)]" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest learning progress across all subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subjectStats
              .filter(stats => stats.progress.last_accessed)
              .sort((a, b) => new Date(b.progress.last_accessed).getTime() - new Date(a.progress.last_accessed).getTime())
              .slice(0, 5)
              .map((stats) => {
                const IconComponent = getSubjectIcon(stats.subject.name)
                return (
                  <div key={stats.subject.id} className="flex items-center justify-between p-3 bg-[var(--muted)]/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getSubjectColorClass(stats.subject.color_theme)}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-[var(--foreground)]">
                          {stats.subject.display_name}
                        </div>
                        <div className="text-sm text-[var(--muted-foreground)]">
                          Last accessed {new Date(stats.progress.last_accessed).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {calculateOverallProgress(stats)}% complete
                    </Badge>
                  </div>
                )
              })}
            
            {subjectStats.every(stats => !stats.progress.last_accessed) && (
              <div className="text-center py-8 text-[var(--muted-foreground)]">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start learning to see your recent activity here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
