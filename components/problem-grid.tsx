"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Trophy, Target, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import ProblemFilters from "./problem-filters"

interface Problem {
  id: string
  title: string
  description: string
  points: number
  time_limit: number
  difficulty_level: number
  category: string
  categories: string
  programming_language: string
  user_progress?: {
    status: string
    best_score: number
    attempts: number
  }[]
}

interface ProblemGridProps {
  userId: string
}

export default function ProblemGrid({ userId }: ProblemGridProps) {
  const [problems, setProblems] = useState<Problem[]>([])
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProblems()
  }, [userId])

  const fetchProblems = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("problems")
        .select(`
          *,
          user_progress!left (status, best_score, attempts)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching problems:", error)
        setError(error.message)
        return
      }

      setProblems(data || [])
      setFilteredProblems(data || [])
    } catch (error) {
      console.error("Error fetching problems:", error)
      setError("Failed to fetch problems")
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = useCallback(
    (filters: {
      search: string
      category: string
      difficulty: string
      status: string
    }) => {
      // Don't apply filters if problems haven't been loaded yet
      if (problems.length === 0) {
        return
      }

      let filtered = [...problems]

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filtered = filtered.filter(
          (problem) =>
            problem.title.toLowerCase().includes(searchLower) ||
            problem.description.toLowerCase().includes(searchLower),
        )
      }

      // Category filter - only apply if not "all"
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter((problem) => problem.category === filters.category)
      }

      // Difficulty filter - only apply if not "all"
      if (filters.difficulty && filters.difficulty !== "all") {
        filtered = filtered.filter((problem) => problem.difficulty_level.toString() === filters.difficulty)
      }

      // Status filter - only apply if not "all"
      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter((problem) => {
          const userProgress = problem.user_progress?.[0]
          const status = userProgress?.status || "not_attempted"
          return status === filters.status
        })
      }
      
      setFilteredProblems(filtered)
    },
    [problems],
  )

  const getStatusBadge = (problem: Problem) => {
    const userProgress = problem.user_progress?.[0]
    const status = userProgress?.status || "not_attempted"

    switch (status) {
      case "solved":
        return <Badge className="bg-success/10 text-success border-success/20">Solved</Badge>
      case "attempted":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Attempted</Badge>
      default:
        return <Badge variant="outline" className="border-[var(--border)] text-[var(--muted-foreground)]">Not Attempted</Badge>
    }
  }

  const getDifficultyBadge = (difficultyLevel: number) => {
    if (!difficultyLevel) return null

    const difficultyMap: Record<number, { name: string; color: string }> = {
      1: { name: "Beginner", color: "bg-success/10 text-success border-success/20" },
      2: { name: "Intermediate", color: "bg-warning/10 text-warning border-warning/20" },
      3: { name: "Advanced", color: "bg-destructive/10 text-destructive border-destructive/20" },
    }

    const difficulty = difficultyMap[difficultyLevel] || { name: "Unknown", color: "bg-[var(--muted)]/10 text-[var(--muted-foreground)] border-[var(--border)]/20" }

    return (
      <Badge className={difficulty.color}>
        {difficulty.name}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6" aria-busy={true} aria-live="polite">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ut-orange mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-[var(--muted-foreground)]">Loading problems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6" role="alert" aria-live="assertive">
        <div className="text-center py-12">
          <div className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true">⚠️</div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Error loading problems</h3>
          <p className="text-[var(--muted-foreground)] mb-4">{error}</p>
          <Button onClick={fetchProblems} variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)]">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProblemFilters onFiltersChange={handleFiltersChange} />

      {filteredProblems.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No problems found</h3>
          <p className="text-[var(--muted-foreground)]">
            {problems.length === 0 
              ? "No problems are available in the database." 
              : "Try adjusting your filters or search terms."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProblems.map((problem) => (
            <Card key={problem.id} className="card-ut hover-lift group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  {getDifficultyBadge(problem.difficulty_level)}
                  {getStatusBadge(problem)}
                </div>
                <CardTitle className="text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors break-words">
                  {problem.title}
                </CardTitle>
                <CardDescription className="text-[var(--muted-foreground)] break-words whitespace-normal">
                  {problem.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Problem Stats */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-[var(--muted-foreground)]">
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-4 w-4" />
                    <span>{problem.points} pts</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.round(problem.time_limit / 1000)}s</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{problem.category || 'General'}</span>
                  </div>
                </div>

                {/* User Progress */}
                {problem.user_progress?.[0] && (
                  <div className="mb-4 p-3 bg-slate-gray/5 rounded-lg border border-slate-gray/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">Best Score:</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {problem.user_progress[0].best_score || 0}/{problem.points}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-[var(--muted-foreground)]">Attempts:</span>
                      <span className="font-medium text-[var(--foreground)]">
                        {problem.user_progress[0].attempts || 0}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full bg-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_90%,white)] text-[var(--primary-foreground)] font-semibold"
                >
                  <Link href={`/problems/${problem.id}/practice`}>
                    {problem.user_progress?.[0] ? 'Continue Problem' : 'Start Problem'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
