import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Code, Trophy, Clock, Target, BookOpen } from "lucide-react"
import { signOut } from "@/lib/actions"
import ProblemGrid from "@/components/problem-grid"
import LearningPaths from "@/components/learning-paths"
import ResourceViewer from "@/components/resource-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function ComputerScienceDashboard() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Setup Required</h1>
          <p className="text-[var(--muted-foreground)]">Please configure your Supabase environment variables to get started.</p>
        </div>
      </div>
    )
  }

  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile and CS-specific stats
  let userProfile = null
  let csStats = null
  
  try {
    if (supabase && typeof supabase.from === 'function' && isSupabaseConfigured) {
      // Get user profile
      const profileResponse = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileResponse.data) {
        userProfile = profileResponse.data
      }

      // Get CS-specific progress
      const { data: csProgress } = await supabase
        .from("user_subject_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_id", (await supabase.from("subjects").select("id").eq("name", "computer_science").single()).data?.id)
        .single()

      // Get CS learning path progress
      const { data: learningProgress } = await supabase
        .from("user_learning_progress")
        .select(`
          *,
          learning_path:learning_paths!inner(
            *,
            subject:subjects!inner(name)
          )
        `)
        .eq("user_id", user.id)
        .eq("learning_path.subject.name", "computer_science")

        csStats = {
          learning_paths_completed: learningProgress?.filter((lp: any) => lp.is_completed).length || 0,
        total_learning_paths: learningProgress?.length || 0,
        problems_solved: 0, // Would need to query submissions
        average_score: csProgress?.average_score || 0,
        total_time_minutes: csProgress?.time_spent_minutes || 0,
        last_accessed: csProgress?.last_accessed
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  All Subjects
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                  <Code className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">Computer Science</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-3 py-2 rounded-lg">
                <span>Welcome, {userProfile?.first_name || userProfile?.email || 'User'}</span>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-2xl p-8">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-3">
              Computer Science Dashboard 💻
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg">
              Master Java programming, algorithms, and data structures for UIL Computer Science competitions.
            </p>
          </div>
        </div>

        {/* CS-Specific Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Learning Paths</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {csStats?.learning_paths_completed || 0}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Completed paths
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Problems Solved</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <Code className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {csStats?.problems_solved || 0}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Total problems
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Average Score</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <Trophy className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {Math.round(csStats?.average_score || 0)}%
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Across all problems
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Study Time</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <Clock className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {Math.round((csStats?.total_time_minutes || 0) / 60)}h
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Total time spent
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="learning" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-[var(--card)] border border-[var(--border)] p-1 rounded-xl">
            <TabsTrigger 
              value="learning" 
              className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] rounded-lg transition-all duration-300"
            >
              Learning Paths
            </TabsTrigger>
            <TabsTrigger 
              value="problems" 
              className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] rounded-lg transition-all duration-300"
            >
              Practice Problems
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] rounded-lg transition-all duration-300"
            >
              Resources
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Computer Science Learning Paths</h3>
              <Button asChild style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href="/learning?subject=computer_science">View All Paths</Link>
              </Button>
            </div>
            <LearningPaths userId={user.id} subjectFilter="computer_science" />
          </TabsContent>

          <TabsContent value="problems" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">CS Practice Problems</h3>
              <Button asChild style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href="/problems?subject=computer_science">View All Problems</Link>
              </Button>
            </div>
            <ProblemGrid userId={user.id} />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">CS Resources</h3>
            </div>
            <ResourceViewer subjectName="computer_science" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
