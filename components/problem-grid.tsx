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
        return <Badge className="bg-success/10 text-success border-success/20">Solved</Badge>
      case "attempted":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Attempted</Badge>
      default:
        return <Badge variant="outline" className="border-slate-gray/30 text-slate-gray">Not Attempted</Badge>
    }
  }

  const getDifficultyBadge = (difficulty: any) => {
    if (!difficulty) return null

    const colors: Record<string, string> = {
      Beginner: "bg-success/10 text-success border-success/20",
      Easy: "bg-info/10 text-info border-info/20",
      Medium: "bg-warning/10 text-warning border-warning/20",
      Hard: "bg-destructive/10 text-destructive border-destructive/20",
      Expert: "bg-ut-orange/10 text-ut-orange border-ut-orange/20",
    }

    return (
      <Badge className={colors[difficulty.name] || "bg-slate-gray/10 text-slate-gray border-slate-gray/20"}>
        {difficulty.name}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ut-orange mx-auto mb-4"></div>
          <p className="text-dim-gray">Loading problems...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="h-12 w-12 text-destructive mx-auto mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-smoky-black mb-2">Error loading problems</h3>
          <p className="text-dim-gray mb-4">{error}</p>
          <Button onClick={fetchProblems} variant="outline" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
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
          <Target className="h-12 w-12 text-slate-gray mx-auto mb-4" />
          <h3 className="text-lg font-medium text-smoky-black mb-2">No problems found</h3>
          <p className="text-dim-gray">
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
                  {getDifficultyBadge(problem.difficulty_levels)}
                  {getStatusBadge(problem)}
                </div>
                <CardTitle className="text-lg text-smoky-black group-hover:text-ut-orange transition-colors line-clamp-2">
                  {problem.title}
                </CardTitle>
                <CardDescription className="text-dim-gray line-clamp-3">
                  {problem.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Problem Stats */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-dim-gray">
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
                    <span>{problem.categories?.name || 'General'}</span>
                  </div>
                </div>

                {/* User Progress */}
                {problem.user_progress?.[0] && (
                  <div className="mb-4 p-3 bg-slate-gray/5 rounded-lg border border-slate-gray/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dim-gray">Best Score:</span>
                      <span className="font-medium text-smoky-black">
                        {problem.user_progress[0].best_score || 0}/{problem.points}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-dim-gray">Attempts:</span>
                      <span className="font-medium text-smoky-black">
                        {problem.user_progress[0].attempts || 0}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold"
                >
                  <Link href={`/problems/${problem.id}`}>
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
