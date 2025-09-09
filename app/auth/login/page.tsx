import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
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

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Sign in to continue your UIL CS Academy journey</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
