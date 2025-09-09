import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import PracticeInterface from "@/components/practice-interface"

interface PracticePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { id } = await params
  
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch problem details with test cases
  const { data: problem, error } = await supabase
    .from("problems")
    .select(`
      *,
      test_cases (id, input, expected_output, is_sample, points)
    `)
    .eq("id", id)
    .single()

  if (error || !problem) {
    notFound()
  }

  // Fetch user progress separately
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("status, best_score, attempts")
    .eq("user_id", user.id)
    .eq("problem_id", id)
    .single()

  // Add user progress to problem object
  const problemWithProgress = {
    ...problem,
    user_progress: userProgress
  }

  return <PracticeInterface problem={problemWithProgress} userId={user.id} />
}
