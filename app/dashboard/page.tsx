import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, User, Trophy, Clock, Target, BookOpen } from "lucide-react"
import { signOut } from "@/lib/actions"
import ProblemGrid from "@/components/problem-grid"
import LearningPaths from "@/components/learning-paths"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-ut-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-smoky-black">Setup Required</h1>
          <p className="text-dim-gray">Please configure your Supabase environment variables to get started.</p>
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
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="border-b border-slate-gray/20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-smoky-black">UIL CS Academy</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-dim-gray">
                <User className="h-4 w-4" />
                <span>
                  {userProfile?.first_name || userProfile?.email || 'User'} {userProfile?.last_name || ''}
                </span>
              </div>
              <form action={signOut}>
                <Button variant="outline" size="sm" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-smoky-black mb-2">
            Welcome back, {userProfile?.first_name || userProfile?.email || 'User'}!
          </h2>
          <p className="text-dim-gray">
            Continue your competitive programming journey with our structured learning paths and practice problems.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-ut">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-smoky-black">Learning Paths</CardTitle>
              <BookOpen className="h-4 w-4 text-ut-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-smoky-black">{totalPaths}</div>
              <p className="text-xs text-dim-gray">
                Active paths
              </p>
            </CardContent>
          </Card>

          <Card className="card-ut">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-smoky-black">Modules Completed</CardTitle>
              <Trophy className="h-4 w-4 text-ut-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-smoky-black">{totalModules}</div>
              <p className="text-xs text-dim-gray">
                Total completed
              </p>
            </CardContent>
          </Card>

          <Card className="card-ut">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-smoky-black">Total Score</CardTitle>
              <Target className="h-4 w-4 text-ut-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-smoky-black">{totalScore}</div>
              <p className="text-xs text-dim-gray">
                Points earned
              </p>
            </CardContent>
          </Card>

          <Card className="card-ut">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-smoky-black">Progress</CardTitle>
              <Clock className="h-4 w-4 text-ut-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-smoky-black">
                {totalPaths > 0 ? Math.round((totalModules / (totalPaths * 3)) * 100) : 0}%
              </div>
              <p className="text-xs text-dim-gray">
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="problems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-slate-gray/20">
            <TabsTrigger 
              value="problems" 
              className="data-[state=active]:bg-ut-orange data-[state=active]:text-smoky-black"
            >
              Practice Problems
            </TabsTrigger>
            <TabsTrigger 
              value="learning" 
              className="data-[state=active]:bg-ut-orange data-[state=active]:text-smoky-black"
            >
              Learning Paths
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-smoky-black">Recent Problems</h3>
              <Button asChild className="bg-ut-orange hover:bg-ut-orange/90 text-smoky-black">
                <a href="/problems">View All Problems</a>
              </Button>
            </div>
            <ProblemGrid userId={user.id} />
          </TabsContent>

          <TabsContent value="learning" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-smoky-black">Your Learning Paths</h3>
              <Button asChild className="bg-ut-orange hover:bg-ut-orange/90 text-smoky-black">
                <a href="/learning">View All Paths</a>
              </Button>
            </div>
            <LearningPaths userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
