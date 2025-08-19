import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Trophy, Target, Code } from "lucide-react"
import Link from "next/link"

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
    .select(`
      *,
      categories (name, color),
      difficulty_levels (name, level, color),
      user_progress!left (status, best_score, attempts)
    `)
    .eq("id", id)
    .eq("user_progress.user_id", user.id)
    .single()

  if (error || !problem) {
    notFound()
  }

  const userProgress = problem.user_progress?.[0]
  const status = userProgress?.status || "not_attempted"

  const getStatusBadge = () => {
    switch (status) {
      case "solved":
        return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Solved</Badge>
      case "attempted":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Attempted</Badge>
      default:
        return <Badge variant="outline">Not Attempted</Badge>
    }
  }

  const getDifficultyBadge = () => {
    if (!problem.difficulty_levels) return null

    const colors: Record<string, string> = {
      Beginner: "bg-green-500/10 text-green-700 border-green-500/20",
      Easy: "bg-blue-500/10 text-blue-700 border-blue-500/20",
      Medium: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      Hard: "bg-red-500/10 text-red-700 border-red-500/20",
      Expert: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    }

    return (
      <Badge className={colors[problem.difficulty_levels.name] || "bg-gray-500/10 text-gray-700 border-gray-500/20"}>
        {problem.difficulty_levels.name}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Problem Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">{problem.title}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                {getDifficultyBadge()}
                {getStatusBadge()}
                {problem.categories && <Badge variant="outline">{problem.categories.name}</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span>{problem.points} points</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{problem.time_limit / 1000} seconds</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{problem.memory_limit} MB memory</span>
            </div>
            {userProgress && (
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>{userProgress.attempts} attempts</span>
              </div>
            )}
          </div>
        </div>

        {/* Problem Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Problem Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground whitespace-pre-wrap">{problem.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Input/Output Format */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Input Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{problem.input_format}</p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Output Format</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{problem.output_format}</p>
                </CardContent>
              </Card>
            </div>

            {/* Constraints */}
            {problem.constraints && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Constraints</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{problem.constraints}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sample Input/Output */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Sample Input</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{problem.sample_input}</code>
                </pre>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Sample Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{problem.sample_output}</code>
                </pre>
              </CardContent>
            </Card>

            {problem.explanation && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{problem.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href={`/problems/${problem.id}/practice`}>
                  <Code className="h-4 w-4 mr-2" />
                  Start Coding
                </Link>
              </Button>

              <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
