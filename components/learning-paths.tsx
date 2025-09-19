"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
    const rawPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
    const percentage = Math.min(100, Math.max(0, rawPercentage))

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
      if (!pathId) {
        console.error("No pathId provided")
        return
      }
      
      if (!userId) {
        console.error("No userId available")
        return
      }
      
      console.log("Starting learning path:", pathId)
      console.log("Available pathModules:", pathModules)
      console.log("User ID:", userId)
      
      // Verify user exists in users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, email")
        .eq("id", userId)
        .single()
      
      console.log("User verification result:", { userData, userError })
      
      if (userError) {
        console.error("User not found in users table:", userError)
        console.error("This should not happen if the database trigger is working properly.")
        console.error("Please run the updated database setup script to enable auto user creation.")
        return
      }
      
      // Get the first module of this path
      const filteredModules = pathModules.filter(m => m.learning_path_id === pathId)
      console.log("Filtered modules for pathId", pathId, ":", filteredModules)
      console.log("All pathModules:", pathModules.map(m => ({ id: m.id, learning_path_id: m.learning_path_id, name: m.name })))
      
      const firstModule = filteredModules.sort((a, b) => a.order_index - b.order_index)[0]

      console.log("First module found:", firstModule)

      if (!firstModule) {
        console.error("No modules found for this learning path")
        return
      }

      // Check if progress already exists
      console.log("Checking for existing progress with userId:", userId, "pathId:", pathId)
      
      const { data: existingProgress, error: checkError } = await supabase
        .from("user_learning_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("learning_path_id", pathId)
        .single()

      console.log("Existing progress check result:", { existingProgress, checkError })

      if (checkError && checkError.code !== 'PGRST116') {
        console.error("Error checking existing progress:", checkError)
        console.error("Check error details:", {
          message: checkError.message,
          details: checkError.details,
          hint: checkError.hint,
          code: checkError.code
        })
        return
      }

      let error = null
      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await supabase
          .from("user_learning_progress")
          .update({
            current_module_id: firstModule.id,
            last_accessed: new Date().toISOString()
          })
          .eq("user_id", userId)
          .eq("learning_path_id", pathId)
        error = updateError
      } else {
        // Insert new progress
        const { error: insertError } = await supabase
          .from("user_learning_progress")
          .insert({
            user_id: userId,
            learning_path_id: pathId,
            current_module_id: firstModule.id,
            completed_modules: 0,
            total_score: 0,
            started_at: new Date().toISOString(),
            last_accessed: new Date().toISOString(),
            is_completed: false
          })
        error = insertError
      }

      if (error) {
        console.error("Error starting learning path:", error)
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      // Refresh the data
      fetchLearningPaths()

      // Navigate to the first module
      router.push(`/learning/${pathId}/module/${firstModule.id}`)
    } catch (error) {
      console.error("Error starting learning path:", error)
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace')
      console.error("Error type:", typeof error)
      console.error("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : 'Unknown',
        cause: error instanceof Error ? error.cause : undefined
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-8" aria-busy={true} aria-live="polite">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-6" aria-hidden="true"></div>
          <p className="text-[var(--muted-foreground)] text-lg">Loading learning paths...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">Structured Learning Paths</h2>
        <p className="text-[var(--muted-foreground)] max-w-3xl mx-auto text-lg">
          Choose a structured learning path to master Java programming from fundamentals to advanced algorithms. 
          Each path includes multiple choice questions, coding challenges, and hands-on practice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {learningPaths.map((path) => {
          const progress = getPathProgress(path.id)
          const pathModulesCount = pathModules.filter(m => m.learning_path_id === path.id).length
          
          return (
            <Card key={path.id} className="card-modern hover-lift group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                        <BookOpen className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <CardTitle className="text-xl text-[var(--foreground)]">{path.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-3">
                      {getDifficultyBadge(path.difficulty_level)}
                      <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-2 py-1 rounded-md">
                        <Clock className="h-4 w-4" />
                        <span>{path.estimated_hours}h</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-2 py-1 rounded-md">
                        <Trophy className="h-4 w-4" />
                        <span>{pathModulesCount} modules</span>
                      </div>
                    </div>
                  </div>
                  {progress.isCompleted && (
                    <div className="p-2 rounded-full bg-[var(--success)]/10">
                      <CheckCircle className="h-6 w-6 text-[var(--success)]" />
                    </div>
                  )}
                </div>
                <CardDescription className="text-base text-[var(--muted-foreground)] leading-relaxed">
                  {path.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {progress.isStarted && (
                  <div className="space-y-3 p-4 bg-[var(--muted)]/30 rounded-lg">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-[var(--foreground)]">Progress</span>
                      <span className="text-[var(--foreground)]">{progress.completed}/{progress.total} modules</span>
                    </div>
                    <Progress value={progress.percentage} className="h-3" />
                    <p className="text-sm text-[var(--muted-foreground)] text-center">
                      {progress.percentage}% complete
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {progress.isStarted ? (
                    <Button 
                      onClick={() => {
                        // Navigate to the current module the user is working on
                        const userPathProgress = userProgress.find(p => p.learning_path_id === path.id)
                        if (userPathProgress?.current_module_id) {
                          router.push(`/learning/${path.id}/module/${userPathProgress.current_module_id}`)
                        } else {
                          // Fallback to first module if no current module
                          const firstModule = pathModules
                            .filter(m => m.learning_path_id === path.id)
                            .sort((a, b) => a.order_index - b.order_index)[0]
                          
                          if (firstModule) {
                            router.push(`/learning/${path.id}/module/${firstModule.id}`)
                          }
                        }
                      }}
                      className="flex-1 btn-primary hover-glow text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => startLearningPath(path.id)}
                      className="flex-1 btn-primary hover-glow text-[var(--primary-foreground)]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  )}
                  
                  <Button asChild variant="outline" size="sm" className="btn-outline hover-lift text-[var(--foreground)]">
                    <Link href={`/learning/${path.id}`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Preview
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {learningPaths.length === 0 && (
        <div className="text-center py-16">
          <div className="p-4 rounded-full bg-[var(--muted)]/30 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-[var(--muted-foreground)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">No learning paths available</h3>
          <p className="text-[var(--muted-foreground)] text-lg">Learning paths will be available soon.</p>
        </div>
      )}
    </div>
  )
}
