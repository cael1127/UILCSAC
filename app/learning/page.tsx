import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Clock, Users, Trophy } from "lucide-react"
import Link from "next/link"

export default async function LearningPage() {
  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get all learning paths
  const { data: learningPaths } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })

  // Get user progress for all paths
  const { data: userProgress } = await supabase
    .from("user_learning_progress")
    .select("*")
    .eq("user_id", user.id)

  // Create a map of user progress by path ID
  const progressMap = new Map(
    userProgress?.map(progress => [progress.learning_path_id, progress]) || []
  )

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="border-b border-slate-gray/20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-smoky-black hover:bg-slate-gray/10">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-smoky-black">Learning Paths</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-smoky-black mb-4">
            Choose Your Learning Journey
          </h2>
          <p className="text-xl text-dim-gray max-w-2xl mx-auto">
            Select a learning path to master competitive programming concepts and prepare for UIL competitions
          </p>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningPaths?.map((path) => {
            const userPathProgress = progressMap.get(path.id)
            const totalModules = path.total_modules || 0
            const completedModules = userPathProgress?.completed_modules || 0
            const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

            return (
              <Card key={path.id} className="card-ut hover-lift group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant={path.difficulty === 'beginner' ? 'default' : path.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {path.difficulty?.charAt(0).toUpperCase() + path.difficulty?.slice(1) || 'Beginner'}
                    </Badge>
                    {userPathProgress && (
                      <div className="text-sm text-dim-gray">
                        {Math.round(progressPercentage)}% Complete
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg text-smoky-black group-hover:text-ut-orange transition-colors">
                    {path.name}
                  </CardTitle>
                  <CardDescription className="text-dim-gray">
                    {path.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  {/* Path Stats */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-dim-gray">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{totalModules} modules</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{path.estimated_hours || '2-4'} hours</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{path.target_audience || 'Students'}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {userPathProgress && (
                    <div className="mb-4">
                      <div className="w-full bg-slate-gray/20 rounded-full h-2">
                        <div 
                          className="bg-ut-orange h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    asChild 
                    className="w-full bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold"
                  >
                    <Link href={`/learning/${path.id}`}>
                      {userPathProgress ? 'Continue Learning' : 'Start Learning'}
                      <Trophy className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {(!learningPaths || learningPaths.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-slate-gray" />
            </div>
            <h3 className="text-lg font-medium text-smoky-black mb-2">No Learning Paths Available</h3>
            <p className="text-dim-gray mb-6">
              Learning paths are being prepared. Check back soon!
            </p>
            <Button asChild variant="outline" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        )}

        {/* Quick Start Section */}
        <div className="mt-16 bg-white border border-slate-gray/20 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-smoky-black mb-4">
              New to Competitive Programming?
            </h3>
            <p className="text-dim-gray mb-6 max-w-2xl mx-auto">
              Start with our beginner-friendly learning paths designed to build your skills step by step. 
              Each path includes interactive exercises, real competition problems, and detailed explanations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold">
                <Link href="/problems">Practice Problems</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
