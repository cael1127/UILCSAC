import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PracticeTestInterface from "@/components/practice-test-interface"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface PracticeTestPageProps {
  params: Promise<{
    testId: string
  }>
}

export default async function PracticeTestPage({ params }: PracticeTestPageProps) {
  const { testId } = await params
  
  // Get the user from the server
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Verify the test exists
  const { data: test, error: testError } = await supabase
    .from("practice_tests")
    .select("*")
    .eq("id", testId)
    .eq("is_active", true)
    .single()

  if (testError || !test) {
    redirect("/problems")
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        <PracticeTestInterface
          testId={testId}
          userId={user.id}
        />
      </div>
    </div>
  )
}
