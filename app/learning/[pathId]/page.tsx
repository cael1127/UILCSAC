import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, CheckCircle, Lock } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface LearningPathPageProps {
  params: Promise<{
    pathId: string
  }>
}

export default async function LearningPathPage({ params }: LearningPathPageProps) {
  const { pathId } = await params
  
  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get learning path details
  const { data: learningPath } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", pathId)
    .single()

  if (!learningPath) {
    redirect("/dashboard")
  }

  // Get all modules for this path
  const { data: modules } = await supabase
    .from("path_modules")
    .select("*")
    .eq("learning_path_id", pathId)
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  // Get user progress
  const { data: userProgress } = await supabase
    .from("user_learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("learning_path_id", pathId)
    .single()

  if (!userProgress) {
    redirect("/dashboard")
  }

  const totalModules = modules?.length || 0
  const completedModules = userProgress.completed_modules || 0
  const rawProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0
  const progressPercentage = Math.min(100, Math.max(0, rawProgress))

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-[var(--foreground)]">{learningPath.name}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Path Overview */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[var(--foreground)] mb-4">{learningPath.name}</h2>
          <p className="text-[var(--muted-foreground)] text-lg mb-6">{learningPath.description}</p>
          
          {/* Progress Overview */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[var(--foreground)]">Overall Progress</h3>
              <span className="text-sm text-[var(--muted-foreground)]">
                {completedModules} of {totalModules} modules completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3 mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-[var(--foreground)]">Modules</h3>
          
          {modules?.map((module: { id: string; name: string; description: string; estimated_hours?: number }, index: number) => {
            const isCompleted = index < completedModules
            const isCurrent = index === completedModules
            const isLocked = index > completedModules
            
            return (
              <Card key={module.id} className={`border-[var(--border)] ${isCompleted ? 'bg-[var(--success)]/5' : 'bg-[var(--card)]'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-[var(--success)]" />
                        ) : isCurrent ? (
                          <div className="h-5 w-5 rounded-full bg-[var(--primary)] animate-pulse" />
                        ) : (
                          <Lock className="h-5 w-5 text-[var(--muted-foreground)]" />
                        )}
                        <CardTitle className="text-lg text-[var(--foreground)]">
                          {index + 1}. {module.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base text-[var(--muted-foreground)]">
                        {module.description}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[var(--muted-foreground)] mb-1">
                        {module.estimated_hours}h
                      </div>
                      {isCompleted && (
                        <Badge className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {isCurrent ? (
                    <Button asChild className="w-full">
                      <Link href={`/learning/${pathId}/module/${module.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Link>
                    </Button>
                  ) : isCompleted ? (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/learning/${pathId}/module/${module.id}`}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Redo Module
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <Lock className="h-4 w-4 mr-2" />
                      Locked
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {modules?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-foreground mb-2">No modules available</h3>
            <p className="text-muted-foreground">This learning path doesn't have any modules yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
