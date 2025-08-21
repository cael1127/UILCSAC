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

  const getPathProgress = (pathId: string) => {
    const progress = userProgress.find(p => p.learning_path_id === pathId)
    const pathModulesCount = pathModules.filter(m => m.learning_path_id === pathId).length
    
    if (!progress) {
      return {
        isStarted: false,
        isCompleted: false,
        completed: 0,
        total: pathModulesCount,
        percentage: 0
      }
    }

    const completed = progress.completed_modules || 0
    const total = pathModulesCount
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      isStarted: true,
      isCompleted: progress.is_completed || false,
      completed,
      total,
      percentage
    }
  }

  const getDifficultyBadge = (difficultyLevel: number) => {
    const difficulties = {
      1: { name: "Beginner", color: "bg-success/10 text-success border-success/20" },
      2: { name: "Intermediate", color: "bg-warning/10 text-warning border-warning/20" },
      3: { name: "Advanced", color: "bg-destructive/10 text-destructive border-destructive/20" }
    }

    const difficulty = difficulties[difficultyLevel as keyof typeof difficulties] || difficulties[1]

    return (
      <Badge className={difficulty.color}>
        {difficulty.name}
      </Badge>
    )
  }

  const startLearningPath = async (pathId: string) => {
    try {
      // Get the first module of this path
      const firstModule = pathModules
        .filter(m => m.learning_path_id === pathId)
        .sort((a, b) => a.order_index - b.order_index)[0]

      if (!firstModule) {
        console.error("No modules found for this learning path")
        return
      }

      // Create or update user progress
      const { error } = await supabase
        .from("user_learning_progress")
        .upsert({
          user_id: userId,
          learning_path_id: pathId,
          current_module_id: firstModule.id,
          completed_modules: 0,
          total_score: 0,
          started_at: new Date().toISOString(),
          last_accessed: new Date().toISOString(),
          is_completed: false
        })

      if (error) {
        console.error("Error starting learning path:", error)
        return
      }

      // Refresh the data
      fetchLearningPaths()

      // Navigate to the first module
      if (typeof window !== 'undefined') {
        window.location.href = `/learning/${pathId}/module/${firstModule.id}`
      }
    } catch (error) {
      console.error("Error starting learning path:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ut-orange mx-auto mb-4"></div>
          <p className="text-dim-gray">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-smoky-black mb-2">Structured Learning Paths</h2>
        <p className="text-dim-gray max-w-2xl mx-auto">
          Choose a structured learning path to master Java programming from fundamentals to advanced algorithms. 
          Each path includes multiple choice questions, coding challenges, and hands-on practice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {learningPaths.map((path) => {
          const progress = getPathProgress(path.id)
          const pathModulesCount = pathModules.filter(m => m.learning_path_id === path.id).length
          
          return (
            <Card key={path.id} className="card-ut hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-ut-orange" />
                      <CardTitle className="text-xl text-smoky-black">{path.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDifficultyBadge(path.difficulty_level)}
                      <div className="flex items-center gap-1 text-sm text-dim-gray">
                        <Clock className="h-4 w-4" />
                        <span>{path.estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-dim-gray">
                        <Trophy className="h-4 w-4" />
                        <span>{pathModulesCount} modules</span>
                      </div>
                    </div>
                  </div>
                  {progress.isCompleted && (
                    <CheckCircle className="h-6 w-6 text-success" />
                  )}
                </div>
                <CardDescription className="text-base text-dim-gray">
                  {path.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {progress.isStarted && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-smoky-black">Progress</span>
                      <span className="text-smoky-black">{progress.completed}/{progress.total} modules</span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <p className="text-xs text-dim-gray">
                      {progress.percentage}% complete
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {progress.isStarted ? (
                    <Button 
                      onClick={() => {
                        // Navigate to the current module the user is working on
                        const userPathProgress = userProgress.find(p => p.learning_path_id === path.id)
                        if (userPathProgress?.current_module_id) {
                          if (typeof window !== 'undefined') {
                            window.location.href = `/learning/${path.id}/module/${userPathProgress.current_module_id}`
                          }
                        } else {
                          // Fallback to first module if no current module
                          const firstModule = pathModules
                            .filter(m => m.learning_path_id === path.id)
                            .sort((a, b) => a.order_index - b.order_index)[0]
                          
                          if (firstModule && typeof window !== 'undefined') {
                            window.location.href = `/learning/${path.id}/module/${firstModule.id}`
                          }
                        }
                      }}
                      className="flex-1 bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold"
                      variant="outline"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => startLearningPath(path.id)}
                      className="flex-1 bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
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
          <BookOpen className="h-12 w-12 text-slate-gray mx-auto mb-4" />
          <h3 className="text-lg font-medium text-smoky-black mb-2">No learning paths available</h3>
          <p className="text-dim-gray">Learning paths will be available soon.</p>
        </div>
      )}
    </div>
  )
}
