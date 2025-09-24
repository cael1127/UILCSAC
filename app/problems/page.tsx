import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Code, Trophy } from "lucide-react"
import Link from "next/link"
import ProblemGrid from "@/components/problem-grid"
import PracticeTestBrowser from "@/components/practice-test-browser"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild className="text-[var(--foreground)] hover:bg-[var(--muted)]/10">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-xl font-bold text-[var(--foreground)]">Practice & Tests</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">
            Practice & Tests
          </h2>
          <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Practice with individual problems or take comprehensive UIL-style practice tests.
          </p>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="problems" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="problems" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Individual Problems
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Practice Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problems" className="space-y-6">
            <ProblemGrid userId={user.id} />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <PracticeTestBrowser userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}