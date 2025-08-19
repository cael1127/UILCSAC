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
  categories: {
    id: string
    name: string
    color: string
  }
  difficulty_levels: {
    id: string
    name: string
    level: number
    color: string
  }
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
          categories (name, color),
          difficulty_levels (name, level, color),
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
        filtered = filtered.filter((problem) => problem.categories?.id === filters.category)
      }

      // Difficulty filter - only apply if not "all"
      if (filters.difficulty && filters.difficulty !== "all") {
        filtered = filtered.filter((problem) => problem.difficulty_levels?.id === filters.difficulty)
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
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Solved</Badge>
      case "attempted":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Attempted</Badge>
      default:
        return <Badge variant="outline">Not Attempted</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: any) => {
    if (!difficulty) return null

    const colors: Record<string, string> = {
      Beginner: "bg-green-500/10 text-green-700 border-green-500/20",
      Easy: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      Hard: "bg-red-500/10 text-red-700 border-red-500/20",
      Expert: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    }

    return (
      <Badge className={colors[difficulty.name] || "bg-gray-500/10 text-gray-700 border-gray-500/20"}>
        {difficulty.name}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading problems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="h-12 w-12 text-red-500 mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-foreground mb-2">Error loading problems</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchProblems} variant="outline">
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
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No problems found</h3>
          <p className="text-muted-foreground">
            {problems.length === 0 
              ? "No problems are available in the database." 
              : "Try adjusting your filters or search terms."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map((problem) => (
            <Card key={problem.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg line-clamp-2">{problem.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getDifficultyBadge(problem.difficulty_levels)}
                      {getStatusBadge(problem)}
                    </div>
                  </div>
                </div>
                <CardDescription className="line-clamp-3">{problem.description.substring(0, 150)}...</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4" />
                      <span>{problem.points} pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{problem.time_limit / 1000}s</span>
                    </div>
                  </div>
                </div>

                {problem.categories && (
                  <div className="mb-4">
                    <Badge variant="outline" className="text-xs">
                      {problem.categories.name}
                    </Badge>
                  </div>
                )}

                <Button asChild className="w-full">
                  <Link href={`/problems/${problem.id}`}>
                    Solve Problem
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
