import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import SignUpForm from "@/components/sign-up-form"

export default async function SignUpPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Connect Supabase to get started</h1>
          <p className="text-muted-foreground">Please configure your Supabase environment variables.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Create an account</h1>
          <p className="text-muted-foreground">Sign up to get started with UIL CS Academy</p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
