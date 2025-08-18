import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import PracticeInterface from "@/components/practice-interface"

interface PracticePageProps {
  params: {
    id: string
  }
}

export default async function PracticePage({ params }: PracticePageProps) {
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
      </div>
    )
  }

  const supabase = createClient()
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
      categories (name, color),
      difficulty_levels (name, level, color),
      user_progress!left (status, best_score, attempts),
      test_cases (id, input, expected_output, is_sample, points)
    `)
    .eq("id", params.id)
    .eq("user_progress.user_id", user.id)
    .single()

  if (error || !problem) {
    notFound()
  }

  return <PracticeInterface problem={problem} userId={user.id} />
}
