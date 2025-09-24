"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  Clock,
  BookOpen,
  Target,
  Download,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

// Simplified interfaces to avoid import issues
interface StudentProgress {
  user_id: string
  user_email: string
  user_name?: string
  subject_progress: any[]
  overall_stats: {
    total_questions_answered: number
    total_time_spent: number
    average_score: number
    subjects_active: number
  }
}

interface TeacherDashboardProps {
  userId: string
  className?: string
}


interface ClassStats {
  total_students: number
  active_students: number
  average_progress: number
  top_performers: StudentProgress[]
  subject_popularity: {
    subject: string
    student_count: number
    avg_progress: number
  }[]
}

export default function TeacherDashboard({ userId, className = '' }: TeacherDashboardProps) {
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [classStats, setClassStats] = useState<ClassStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadTeacherData()
  }, [userId])

  const loadTeacherData = async () => {
    try {
      setLoading(true)

      // For now, we'll show all users as potential students
      // In a real implementation, you'd have teacher-student relationships
      const { data: usersData } = await supabase
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          user_subject_progress(
            *,
            subject:subjects(name, display_name)
          )
        `)
        .neq('id', userId) // Exclude the teacher
        .limit(50)

      // Process student data
      const processedStudents: StudentProgress[] = (usersData || []).map(user => {
        const subjectProgress = user.user_subject_progress?.map((sp: any) => ({
          subject_name: sp.subject?.name || '',
          subject_display_name: sp.subject?.display_name || '',
          completed_paths: sp.completed_learning_paths || 0,
          total_paths: sp.total_learning_paths || 0,
          average_score: sp.average_score || 0,
          time_spent_minutes: sp.time_spent_minutes || 0,
          last_accessed: sp.last_accessed || ''
        })) || []

        const overallStats = {
          total_questions_answered: subjectProgress.reduce((sum, sp) => sum + (sp.completed_paths * 5), 0), // Estimate
          total_time_spent: subjectProgress.reduce((sum, sp) => sum + sp.time_spent_minutes, 0),
          average_score: subjectProgress.length > 0 
            ? Math.round(subjectProgress.reduce((sum, sp) => sum + sp.average_score, 0) / subjectProgress.length)
            : 0,
          subjects_active: subjectProgress.filter(sp => sp.completed_paths > 0).length
        }

        return {
          user_id: user.id,
          user_email: user.email,
          user_name: user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : undefined,
          subject_progress: subjectProgress,
          overall_stats: overallStats
        }
      })

      setStudents(processedStudents)

      // Calculate class statistics
      const activeStudents = processedStudents.filter(s => s.overall_stats.subjects_active > 0)
      const totalProgress = processedStudents.reduce((sum, s) => {
        const studentProgress = s.subject_progress.reduce((pSum, sp) => 
          pSum + (sp.total_paths > 0 ? (sp.completed_paths / sp.total_paths) * 100 : 0), 0
        )
        return sum + (studentProgress / Math.max(s.subject_progress.length, 1))
      }, 0)

      const stats: ClassStats = {
        total_students: processedStudents.length,
        active_students: activeStudents.length,
        average_progress: processedStudents.length > 0 ? Math.round(totalProgress / processedStudents.length) : 0,
        top_performers: processedStudents
          .sort((a, b) => b.overall_stats.average_score - a.overall_stats.average_score)
          .slice(0, 5),
        subject_popularity: [] // Would calculate from actual data
      }

      setClassStats(stats)

    } catch (error) {
      console.error('Error loading teacher data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportClassData = () => {
    // Create CSV data
    const csvData = students.map(student => ({
      Name: student.user_name || student.user_email,
      Email: student.user_email,
      'Active Subjects': student.overall_stats.subjects_active,
      'Average Score': student.overall_stats.average_score + '%',
      'Time Spent': Math.round(student.overall_stats.total_time_spent / 60) + 'h',
      'Questions Answered': student.overall_stats.total_questions_answered
    }))

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {})
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `class-progress-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSubject = selectedSubject === 'all' ||
      student.subject_progress.some(sp => sp.subject_name === selectedSubject)
    
    return matchesSearch && matchesSubject
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`teacher-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Teacher Dashboard
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Monitor student progress across all UIL subjects
        </p>
      </div>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Total Students</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {classStats?.total_students || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-[var(--primary)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Active Students</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {classStats?.active_students || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-[var(--success)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Average Progress</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {classStats?.average_progress || 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-[var(--warning)]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Top Performers</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">
                  {classStats?.top_performers.length || 0}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-[var(--accent)]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="students" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="students">Student Progress</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          <Button onClick={exportClassData} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>

        <TabsContent value="students" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  <option value="all">All Subjects</option>
                  <option value="computer_science">Computer Science</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="literature">Literature</option>
                  <option value="spelling">Spelling</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Student List */}
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <Card key={student.user_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--foreground)]">
                        {student.user_name || student.user_email}
                      </h3>
                      {student.user_name && (
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {student.user_email}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[var(--primary)]">
                        {student.overall_stats.average_score}%
                      </div>
                      <div className="text-sm text-[var(--muted-foreground)]">
                        Average Score
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--foreground)]">
                        {student.overall_stats.subjects_active}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Active Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--foreground)]">
                        {student.overall_stats.total_questions_answered}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Questions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--foreground)]">
                        {Math.round(student.overall_stats.total_time_spent / 60)}h
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Time Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-[var(--foreground)]">
                        {student.subject_progress.filter(sp => sp.last_accessed).length > 0 ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-xs text-[var(--muted-foreground)]">Status</div>
                    </div>
                  </div>

                  {/* Subject Progress */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-[var(--foreground)]">Subject Progress</h4>
                    {student.subject_progress.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {student.subject_progress.map((sp) => (
                          <div key={sp.subject_name} className="flex items-center justify-between p-2 bg-[var(--muted)]/30 rounded">
                            <span className="text-sm font-medium">{sp.subject_display_name}</span>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={sp.total_paths > 0 ? (sp.completed_paths / sp.total_paths) * 100 : 0} 
                                className="w-16 h-2" 
                              />
                              <span className="text-xs text-[var(--muted-foreground)]">
                                {sp.completed_paths}/{sp.total_paths}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--muted-foreground)]">No progress data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredStudents.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                  <p className="text-[var(--muted-foreground)]">No students found matching your criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Class Analytics
              </CardTitle>
              <CardDescription>
                Detailed analytics and insights about your class performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="h-16 w-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-[var(--muted-foreground)]">
                  Detailed charts, progress trends, and performance insights will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Progress Reports
              </CardTitle>
              <CardDescription>
                Generate and download detailed progress reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Download className="h-16 w-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                  Custom Reports Coming Soon
                </h3>
                <p className="text-[var(--muted-foreground)] mb-4">
                  Generate custom reports by date range, subject, or student group.
                </p>
                <Button onClick={exportClassData} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Current Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
