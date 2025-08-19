import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ModuleInterface from "@/components/module-interface"

interface LearningModulePageProps {
  params: Promise<{
    pathId: string
    moduleId: string
  }>
}

export default async function LearningModulePage({ params }: LearningModulePageProps) {
  const { pathId, moduleId } = await params
  
  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Verify the user has access to this learning path
  const { data: userProgress } = await supabase
    .from("user_learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("learning_path_id", pathId)
    .single()

  // If user hasn't started this path, redirect to dashboard
  if (!userProgress) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-card-foreground">Learning Module</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8">
        <ModuleInterface 
          pathId={pathId}
          moduleId={moduleId}
          userId={user.id}
        />
      </div>
    </div>
  )
}
