import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Atom, Trophy, Clock, Target, BookOpen, Microscope, FlaskConical } from "lucide-react"
import { signOut } from "@/lib/actions"
import LearningPaths from "@/components/learning-paths"
import PracticeTestBrowser from "@/components/practice-test-browser"
import ResourceViewer from "@/components/resource-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function ScienceDashboard() {
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

  // Get user profile and Science-specific stats
  let userProfile = null
  let scienceStats = null
  
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

      // Get Science-specific progress
      const { data: scienceProgress } = await supabase
        .from("user_subject_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("subject_id", (await supabase.from("subjects").select("id").eq("name", "science").single()).data?.id)
        .single()

      scienceStats = {
        learning_paths_completed: scienceProgress?.completed_learning_paths || 0,
        total_learning_paths: scienceProgress?.total_learning_paths || 0,
        practice_tests_completed: scienceProgress?.completed_practice_tests || 0,
        average_score: scienceProgress?.average_score || 0,
        total_time_minutes: scienceProgress?.time_spent_minutes || 0,
        last_accessed: scienceProgress?.last_accessed
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
                  <Atom className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">Science</h1>
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
              Science Dashboard 🔬
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg">
              Explore Biology, Chemistry, Physics, and Earth Science with comprehensive content, formulas, and hands-on practice.
            </p>
          </div>
        </div>

        {/* Science-Specific Stats */}
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
                {scienceStats?.learning_paths_completed || 0}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Completed paths
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Lab Simulations</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <Microscope className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {scienceStats?.practice_tests_completed || 0}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Experiments done
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
                {Math.round(scienceStats?.average_score || 0)}%
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Overall performance
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
                {Math.round((scienceStats?.total_time_minutes || 0) / 60)}h
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Time studied
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
              value="tests" 
              className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] rounded-lg transition-all duration-300"
            >
              Practice Tests
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
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Science Learning Paths</h3>
              <Button asChild style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href="/learning?subject=science">View All Paths</Link>
              </Button>
            </div>
            <LearningPaths userId={user.id} subjectFilter="science" />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Science Practice Tests</h3>
              <Button asChild style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href="/problems?subject=science">View All Tests</Link>
              </Button>
            </div>
            <PracticeTestBrowser userId={user.id} subjectFilter="science" />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Science Resources</h3>
            </div>
            <ResourceViewer subjectName="science" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
