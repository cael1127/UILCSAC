"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Trophy, Play, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

interface LearningPath {
  id: string
  name: string
  description: string
  difficulty_level: number
  estimated_hours: number
}

interface PathModule {
  id: string
  learning_path_id: string
  name: string
  description: string
  order_index: number
  estimated_hours: number
}

interface UserProgress {
  learning_path_id: string
  current_module_id: string
  completed_modules: number
  total_score: number
  is_completed: boolean
}

interface LearningPathsProps {
  userId: string
}

export default function LearningPaths({ userId }: LearningPathsProps) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([])
  const [pathModules, setPathModules] = useState<PathModule[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLearningPaths()
  }, [userId])

  const fetchLearningPaths = async () => {
    try {
      setLoading(true)

      // Fetch learning paths
      const { data: paths, error: pathsError } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("is_active", true)
        .order("difficulty_level", { ascending: true })

      if (pathsError) {
        console.error("Error fetching learning paths:", pathsError)
        return
      }

      setLearningPaths(paths || [])

      // Fetch path modules
      if (paths && paths.length > 0) {
        const { data: modules, error: modulesError } = await supabase
          .from("path_modules")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true })

        if (modulesError) {
          console.error("Error fetching path modules:", modulesError)
          return
        }

        setPathModules(modules || [])
      }

      // Fetch user progress
      const { data: progress, error: progressError } = await supabase
        .from("user_learning_progress")
        .select("*")
        .eq("user_id", userId)

      if (progressError) {
        console.error("Error fetching user progress:", progressError)
        return
      }

      setUserProgress(progress || [])
    } catch (error) {
      console.error("Error fetching learning paths:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyBadge = (level: number) => {
    const difficulties = [
      { name: "Beginner", color: "bg-green-500/10 text-green-700 border-green-500/20" },
      { name: "Easy", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
      { name: "Medium", color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      { name: "Hard", color: "bg-red-500/10 text-red-700 border-red-500/20" },
      { name: "Expert", color: "bg-purple-500/10 text-purple-700 border-purple-500/20" }
    ]

    const difficulty = difficulties[Math.min(level - 1, difficulties.length - 1)]
    return (
      <Badge className={difficulty.color}>
        {difficulty.name}
      </Badge>
    )
  }

  const getPathProgress = (pathId: string) => {
    const progress = userProgress.find(p => p.learning_path_id === pathId)
    if (!progress) return { completed: 0, total: 0, percentage: 0, isStarted: false }
    
    const totalModules = pathModules.filter(m => m.learning_path_id === pathId).length
    const percentage = totalModules > 0 ? (progress.completed_modules / totalModules) * 100 : 0
    
    return {
      completed: progress.completed_modules,
      total: totalModules,
      percentage: Math.round(percentage),
      isStarted: true,
      isCompleted: progress.is_completed
    }
  }

  const startLearningPath = async (pathId: string) => {
    try {
      // Check if user already has progress for this path
      const existingProgress = userProgress.find(p => p.learning_path_id === pathId)
      
      if (!existingProgress) {
        // Get first module of the path
        const firstModule = pathModules
          .filter(m => m.learning_path_id === pathId)
          .sort((a, b) => a.order_index - b.order_index)[0]

        if (firstModule) {
          const { error } = await supabase
            .from("user_learning_progress")
            .insert({
              user_id: userId,
              learning_path_id: pathId,
              current_module_id: firstModule.id,
              completed_modules: 0,
              total_score: 0
            })

          if (error) {
            console.error("Error starting learning path:", error)
            alert(`Error starting learning path: ${error.message}`)
            return
          }

          // Refresh progress
          fetchLearningPaths()
        } else {
          console.error("No first module found for path:", pathId)
          alert("Error: No modules found for this learning path")
          return
        }
      }

      // Navigate to the learning path overview
      window.location.href = `/learning/${pathId}`
    } catch (error) {
      console.error("Error starting learning path:", error)
      alert(`Error starting learning path: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Learning Paths</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose a structured learning path to master Java programming from fundamentals to advanced algorithms. 
          Each path includes multiple choice questions, coding challenges, and hands-on practice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {learningPaths.map((path) => {
          const progress = getPathProgress(path.id)
          const pathModulesCount = pathModules.filter(m => m.learning_path_id === path.id).length
          
          return (
            <Card key={path.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{path.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDifficultyBadge(path.difficulty_level)}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{path.estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Trophy className="h-4 w-4" />
                        <span>{pathModulesCount} modules</span>
                      </div>
                    </div>
                  </div>
                  {progress.isCompleted && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <CardDescription className="text-base">
                  {path.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {progress.isStarted && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.completed}/{progress.total} modules</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.percentage}% complete
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {progress.isStarted ? (
                    <Button 
                      onClick={() => startLearningPath(path.id)}
                      className="flex-1"
                      variant="outline"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => startLearningPath(path.id)}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {learningPaths.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No learning paths available</h3>
          <p className="text-muted-foreground">Learning paths will be available soon.</p>
        </div>
      )}
    </div>
  )
}
