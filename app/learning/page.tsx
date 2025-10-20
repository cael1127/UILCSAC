import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import React from "react"
import LearningPaths from "@/components/learning-paths"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Code, 
  Calculator, 
  Atom, 
  BookOpen, 
  SpellCheck,
  ArrowLeft,
  Filter
} from "lucide-react"
import Link from "next/link"
// Using regular Card components with CSS animations

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

const SUBJECT_ICONS = {
  'computer_science': Code,
  'mathematics': Calculator,
  'science': Atom,
  'literature': BookOpen,
  'spelling': SpellCheck,
} as const

const SUBJECT_COLORS = {
  'blue': 'bg-blue-500/10 text-blue-700 border-blue-200',
  'green': 'bg-green-500/10 text-green-700 border-green-200',
  'purple': 'bg-purple-500/10 text-purple-700 border-purple-200',
  'orange': 'bg-orange-500/10 text-orange-700 border-orange-200',
  'pink': 'bg-pink-500/10 text-pink-700 border-pink-200',
} as const

interface LearningPageProps {
  searchParams: Promise<{ subject?: string }>
}

export default async function LearningPage({ searchParams }: LearningPageProps) {
  const { subject: subjectFilter } = await searchParams

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

  // Get subject information if filtering
  let currentSubject = null
  if (subjectFilter) {
    const { data: subjectData } = await supabase
      .from("subjects")
      .select("*")
      .eq("name", subjectFilter)
      .eq("is_active", true)
      .single()
    
    currentSubject = subjectData
  }

  // Get all subjects for the filter dropdown
  const { data: allSubjects } = await supabase
    .from("subjects")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })

  const getSubjectIcon = (subjectName: string) => {
    const IconComponent = SUBJECT_ICONS[subjectName as keyof typeof SUBJECT_ICONS] || BookOpen
    return IconComponent
  }

  const getSubjectColorClass = (colorTheme: string) => {
    return SUBJECT_COLORS[colorTheme as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.blue
  }

  return (
    <div className="min-h-screen bg-[var(--background)] relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)]/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-[var(--primary)]/20 rounded-full blur-xl animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                     <Button asChild variant="ghost" size="sm">
                       <Link href="/dashboard" className="flex items-center gap-2">
                         <ArrowLeft className="h-4 w-4" />
                         Back to Dashboard
                       </Link>
                     </Button>
              
              {currentSubject && (
                <Card className="flex items-center gap-3 p-4" >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {React.createElement(getSubjectIcon(currentSubject.name), { 
                      className: "w-12 h-12 text-[var(--primary)]" 
                    })}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">
                      {currentSubject.display_name}
                    </h1>
                    <p className="text-[var(--muted-foreground)]">
                      {currentSubject.description}
                    </p>
                  </div>
                </Card>
              )}
              
              {!currentSubject && (
                <div>
                  <h1 className="text-3xl font-bold text-[var(--foreground)]">
                    Learning Paths
                  </h1>
                  <p className="text-[var(--muted-foreground)]">
                    Choose your UIL subject and start learning
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Subject Filter */}
          {!currentSubject && allSubjects && allSubjects.length > 0 && (
            <Card className="mb-8" >
              <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Filter className="w-5 h-5 text-[var(--accent)]" />
                       Choose Your Subject
                     </CardTitle>
                <CardDescription>
                  Select a UIL subject to view its learning paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allSubjects.map((subject: any) => {
                    const IconComponent = getSubjectIcon(subject.name)
                    return (
                      <Link
                        key={subject.id}
                        href={`/learning?subject=${subject.name}`}
                        className="block"
                      >
                        <Card className="group cursor-pointer" >
                                 <CardContent className="p-6">
                                   <div className="flex items-center gap-3 mb-3">
                                     <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                       <IconComponent className="w-8 h-8 text-[var(--primary)]" />
                                     </div>
                                     <div>
                                       <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                         {subject.display_name}
                                       </h3>
                                       <Badge variant="secondary" className="text-xs">
                                         {subject.name.replace('_', ' ')}
                                       </Badge>
                                     </div>
                                   </div>
                                   <p className="text-sm text-[var(--muted-foreground)]">
                                     {subject.description}
                                   </p>
                                 </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Learning Paths */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        }>
          <LearningPaths userId={user.id} subjectFilter={subjectFilter} />
        </Suspense>
      </div>
    </div>
  )
}