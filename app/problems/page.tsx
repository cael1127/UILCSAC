import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Search, Code, Clock, Target, Filter } from "lucide-react"
import Link from "next/link"

export default async function ProblemsPage() {
  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get all problems
  const { data: problems } = await supabase
    .from("problems")
    .select("*")
    .eq("is_active", true)
    .order("difficulty_level", { ascending: true })

  // Get problem categories
  const { data: categories } = await supabase
    .from("problem_categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true })

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="border-b border-slate-gray/20 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-smoky-black hover:bg-slate-gray/10">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-smoky-black">Practice Problems</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-smoky-black mb-4">
            Master Competitive Programming
          </h2>
          <p className="text-xl text-dim-gray max-w-2xl mx-auto">
            Practice with real UIL-style problems. Build your skills with our comprehensive problem database.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border border-slate-gray/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dim-gray" />
                <Input 
                  placeholder="Search problems..." 
                  className="pl-10 border-slate-gray/20 focus:border-ut-orange"
                />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-48 border-slate-gray/20 focus:border-ut-orange">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-48 border-slate-gray/20 focus:border-ut-orange">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems?.map((problem) => (
            <Card key={problem.id} className="card-ut hover-lift group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant={
                      problem.difficulty_level === 1 ? 'default' : 
                      problem.difficulty_level === 2 ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {problem.difficulty_level === 1 ? 'Beginner' : 
                     problem.difficulty_level === 2 ? 'Intermediate' : 'Advanced'}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-dim-gray">
                    <Clock className="h-3 w-3" />
                    <span>{problem.time_limit || '5'} min</span>
                  </div>
                </div>
                <CardTitle className="text-lg text-smoky-black group-hover:text-ut-orange transition-colors line-clamp-2">
                  {problem.title}
                </CardTitle>
                <CardDescription className="text-dim-gray line-clamp-2">
                  {problem.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Problem Stats */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-dim-gray">
                  <div className="flex items-center space-x-1">
                    <Code className="h-4 w-4" />
                    <span>{problem.programming_language || 'Java'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-4 w-4" />
                    <span>{problem.points || '100'} pts</span>
                  </div>
                </div>

                {/* Categories */}
                {problem.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {problem.categories.split(',').slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-slate-gray/30 text-slate-gray">
                        {category.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  asChild 
                  className="w-full bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold"
                >
                  <Link href={`/problems/${problem.id}`}>
                    Start Problem
                    <Code className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {(!problems || problems.length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Code className="h-8 w-8 text-slate-gray" />
            </div>
            <h3 className="text-lg font-medium text-smoky-black mb-2">No Problems Available</h3>
            <p className="text-dim-gray mb-6">
              Practice problems are being prepared. Check back soon!
            </p>
            <Button asChild variant="outline" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        )}

        {/* Quick Start Section */}
        <div className="mt-16 bg-white border border-slate-gray/20 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-smoky-black mb-4">
              Ready to Practice?
            </h3>
            <p className="text-dim-gray mb-6 max-w-2xl mx-auto">
              Start with beginner problems to build your confidence, then work your way up to more challenging ones. 
              Each problem includes detailed explanations and test cases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold">
                <Link href="/learning">Learning Paths</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
