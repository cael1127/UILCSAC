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
  
  console.log("Learning module page params:", { pathId, moduleId })
  
  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Verify the module exists
  const { data: module, error: moduleError } = await supabase
    .from("path_modules")
    .select("*")
    .eq("id", moduleId)
    .eq("learning_path_id", pathId)
    .single()

  console.log("Module query result:", { module, moduleError })

  if (moduleError || !module) {
    console.error("Module not found:", moduleError)
    redirect("/dashboard")
  }

  // Ensure the user has a progress row for this learning path (create if missing)
  const { data: userProgress } = await supabase
    .from("user_learning_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("learning_path_id", pathId)
    .maybeSingle()

  if (!userProgress) {
    // Create an initial progress record pointing at the current module
    const { error: createProgressError } = await supabase
      .from("user_learning_progress")
      .insert({
        user_id: user.id,
        learning_path_id: pathId,
        current_module_id: moduleId,
        completed_modules: 0,
        total_score: 0,
        is_completed: false,
        started_at: new Date().toISOString(),
        last_accessed: new Date().toISOString(),
      })

    if (createProgressError) {
      console.error("Failed to create initial learning progress:", createProgressError)
      // Allow the page to continue rendering even if creation fails
    }
  }

  // Debug: Check if questions exist for this module
  const { data: questionCount, error: questionCountError } = await supabase
    .from("questions")
    .select("id", { count: "exact" })
    .eq("module_id", moduleId)
    .eq("is_active", true)

  console.log("Question count for module:", { 
    count: questionCount?.length || 0, 
    error: questionCountError 
  })

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
