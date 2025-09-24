"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Clock, 
  Trophy, 
  Target,
  Play,
  RotateCcw,
  TrendingUp,
  Calendar,
  BookOpen,
  Star
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { PracticeTest, Subject, UserPracticeTestAttempt } from '@/lib/types/subjects'

interface PracticeTestBrowserProps {
  userId: string
  subjectFilter?: string
  className?: string
}

interface TestWithAttempts extends PracticeTest {
  subject?: Subject
  attempts?: UserPracticeTestAttempt[]
  bestScore?: number
  lastAttempt?: string
  timesAttempted?: number
}

// Helper functions
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

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'mock_exam': return <Trophy className="h-4 w-4" />
    case 'diagnostic': return <Target className="h-4 w-4" />
    case 'review': return <RotateCcw className="h-4 w-4" />
    default: return <BookOpen className="h-4 w-4" />
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

export default function PracticeTestBrowser({
  userId,
  subjectFilter,
  className = ''
}: PracticeTestBrowserProps) {
  const router = useRouter()
  const [tests, setTests] = useState<TestWithAttempts[]>([])
  const [filteredTests, setFilteredTests] = useState<TestWithAttempts[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(subjectFilter || 'all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadData()
  }, [userId])

  useEffect(() => {
    filterAndSortTests()
  }, [tests, searchTerm, selectedSubject, selectedDifficulty, selectedType, sortBy])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      setSubjects(subjectsData || [])

      // Load practice tests with user attempts
      const { data: testsData } = await supabase
        .from('practice_tests')
        .select(`
          *,
          subject:subjects(*),
          attempts:user_practice_test_attempts(
            id,
            total_score,
            max_possible_score,
            completed_at,
            is_completed
          )
        `)
        .eq('is_active', true)
        .eq('attempts.user_id', userId)
        .order('created_at', { ascending: false })

      // Process test data with attempt statistics
      const processedTests: TestWithAttempts[] = (testsData || []).map(test => {
        const completedAttempts = test.attempts?.filter((a: any) => a.is_completed) || []
        const bestScore = completedAttempts.length > 0 
          ? Math.max(...completedAttempts.map((a: any) => Math.round((a.total_score / a.max_possible_score) * 100)))
          : undefined
        const lastAttempt = completedAttempts.length > 0
          ? completedAttempts.sort((a: any, b: any) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0].completed_at
          : undefined

        return {
          ...test,
          bestScore,
          lastAttempt,
          timesAttempted: completedAttempts.length
        }
      })

      setTests(processedTests)
    } catch (error) {
      console.error('Error loading practice tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortTests = () => {
    let filtered = [...tests]

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(test => test.subject?.name === selectedSubject)
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(test => test.difficulty_level === parseInt(selectedDifficulty))
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(test => test.test_type === selectedType)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'difficulty':
          return a.difficulty_level - b.difficulty_level
        case 'title':
          return a.title.localeCompare(b.title)
        case 'best_score':
          return (b.bestScore || 0) - (a.bestScore || 0)
        default:
          return 0
      }
    })

    setFilteredTests(filtered)
  }

  const startTest = (testId: string) => {
    router.push(`/practice-test/${testId}`)
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
    <div className={`practice-test-browser ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Practice Tests
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Test your knowledge with UIL-style practice exams
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Subject Filter */}
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
                <SelectItem value="5">Level 5</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="mock_exam">Mock Exam</SelectItem>
                <SelectItem value="diagnostic">Diagnostic</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="best_score">Best Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Tests ({filteredTests.length})</TabsTrigger>
          <TabsTrigger value="attempted">
            Attempted ({filteredTests.filter(t => t.timesAttempted && t.timesAttempted > 0).length})
          </TabsTrigger>
          <TabsTrigger value="new">
            New ({filteredTests.filter(t => !t.timesAttempted || t.timesAttempted === 0).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <TestGrid tests={filteredTests} onStartTest={startTest} />
        </TabsContent>

        <TabsContent value="attempted" className="space-y-6">
          <TestGrid 
            tests={filteredTests.filter(t => t.timesAttempted && t.timesAttempted > 0)} 
            onStartTest={startTest} 
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          <TestGrid 
            tests={filteredTests.filter(t => !t.timesAttempted || t.timesAttempted === 0)} 
            onStartTest={startTest} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TestGrid({ 
  tests, 
  onStartTest 
}: { 
  tests: TestWithAttempts[]
  onStartTest: (testId: string) => void 
}) {
  if (tests.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-[var(--muted-foreground)]">No tests found matching your criteria.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => (
        <Card key={test.id} className="hover:shadow-lg transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg group-hover:text-[var(--primary)] transition-colors">
                  {test.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {test.description}
                </CardDescription>
              </div>
              {test.bestScore !== undefined && (
                <div className="ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[var(--primary)]">
                      {test.bestScore}%
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Best Score
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">
                {test.subject?.display_name}
              </Badge>
              <Badge className={getDifficultyColor(test.difficulty_level)}>
                Level {test.difficulty_level}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {getTypeIcon(test.test_type)}
                {test.test_type.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Test Stats */}
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-semibold text-[var(--foreground)]">
                  {test.total_points}
                </div>
                <div className="text-[var(--muted-foreground)]">Points</div>
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">
                  {test.time_limit_minutes || 'No'}
                </div>
                <div className="text-[var(--muted-foreground)]">
                  {test.time_limit_minutes ? 'Minutes' : 'Limit'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-[var(--foreground)]">
                  {test.timesAttempted || 0}
                </div>
                <div className="text-[var(--muted-foreground)]">Attempts</div>
              </div>
            </div>

            {/* Last Attempt */}
            {test.lastAttempt && (
              <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last attempt: {formatDate(test.lastAttempt)}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={() => onStartTest(test.id)}
              className="w-full"
              variant={test.timesAttempted ? "outline" : "default"}
            >
              {test.timesAttempted ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Test
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
