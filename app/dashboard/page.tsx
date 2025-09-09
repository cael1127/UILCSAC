import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Trophy, Clock, Target, BookOpen, Code } from "lucide-react"
import { signOut } from "@/lib/actions"
import ProblemGrid from "@/components/problem-grid"
import LearningPaths from "@/components/learning-paths"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-ut-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
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

  // Get user profile data
  let userProfile = null
  let userStats = null
  
  try {
    // Check if this is a real Supabase client (not the dummy one)
    if (supabase && typeof supabase.from === 'function' && isSupabaseConfigured) {
      // Get user profile from users table
      const profileResponse = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()
      
      // Check if we got real data (not from dummy client)
      if (profileResponse && 'data' in profileResponse && profileResponse.data) {
        userProfile = profileResponse.data
      }

      // Get user progress from user_learning_progress table
      const statsResponse = await supabase
        .from("user_learning_progress")
        .select("completed_modules, total_score")
        .eq("user_id", user.id)
      
      // Check if we got real data (not from dummy client)
      if (statsResponse && 'data' in statsResponse && statsResponse.data) {
        userStats = statsResponse.data
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  // Calculate stats from user progress
  const totalPaths = userStats?.length || 0
  const totalModules = userStats?.reduce((sum: number, stat: any) => sum + (stat.completed_modules || 0), 0) || 0
  const totalScore = userStats?.reduce((sum: number, stat: any) => sum + (stat.total_score || 0), 0) || 0

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Enhanced Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                  <Code className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">UIL CS Academy</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-3 py-2 rounded-lg">
                <User className="h-4 w-4" />
                <span className="font-medium">
                  {userProfile?.first_name || userProfile?.email || 'User'} {userProfile?.last_name || ''}
                </span>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm" className="btn-outline hover-lift text-[var(--foreground)]">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-2xl p-8">
            <h2 className="text-4xl font-bold text-[var(--foreground)] mb-3">
              Welcome back, {userProfile?.first_name || userProfile?.email || 'User'}! 👋
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg">
              Continue your competitive programming journey with our structured learning paths and practice problems.
            </p>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="card-modern hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Learning Paths</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors">
                <BookOpen className="h-5 w-5 text-[var(--primary)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">{totalPaths}</div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Active paths
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Modules Completed</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--success)]/10 group-hover:bg-[var(--success)]/20 transition-colors">
                <Trophy className="h-5 w-5 text-[var(--success)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">{totalModules}</div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Total completed
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Total Score</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--warning)]/10 group-hover:bg-[var(--warning)]/20 transition-colors">
                <Target className="h-5 w-5 text-[var(--warning)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">{totalScore}</div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Points earned
              </p>
            </CardContent>
          </Card>

          <Card className="card-modern hover-lift group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--foreground)]">Progress</CardTitle>
              <div className="p-2 rounded-lg bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 transition-colors">
                <Clock className="h-5 w-5 text-[var(--accent)]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--foreground)] mb-1">
                {totalPaths > 0 ? Math.round((totalModules / (totalPaths * 3)) * 100) : 0}%
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content Tabs */}
        <Tabs defaultValue="problems" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-[var(--card)] border border-[var(--border)] p-1 rounded-xl">
            <TabsTrigger 
              value="problems" 
              className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] data-[state=inactive]:text-[var(--foreground)] rounded-lg transition-all duration-300"
            >
              Practice Problems
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] data-[state=inactive]:text-[var(--foreground)] rounded-lg transition-all duration-300"
            >
              Learning Paths
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Recent Problems</h3>
              <Button asChild className="btn-primary hover-glow text-[var(--primary-foreground)]">
                <Link href="/problems">View All Problems</Link>
              </Button>
            </div>
            <ProblemGrid userId={user.id} />
          </TabsContent>

          <TabsContent value="learning" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Your Learning Paths</h3>
              <Button asChild className="btn-primary hover-glow text-[var(--primary-foreground)]">
                <Link href="/learning">View All Paths</Link>
              </Button>
            </div>
            <LearningPaths userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
