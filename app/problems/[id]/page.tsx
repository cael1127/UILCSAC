import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface ProblemPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProblemPage({ params }: ProblemPageProps) {
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

  // Fetch problem details
  const { data: problem, error } = await supabase
    .from("problems")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !problem) {
    notFound()
  }

  // Automatically redirect to the practice/coding interface
  redirect(`/problems/${id}/practice`)
}
