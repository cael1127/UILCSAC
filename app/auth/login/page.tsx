import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import LoginForm from "@/components/login-form"
import { Card } from "@/components/ui/card"
import { GraduationCap, AlertTriangle } from "lucide-react"

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Simple animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)]/10" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-[var(--primary)]/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <Card className="w-full max-w-md relative z-10 border-[var(--destructive)]/20 shadow-lg">
          <div className="text-center p-8">
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-[var(--destructive)]" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Setup Required</h1>
            <p className="text-[var(--muted-foreground)]">Please configure your Supabase environment variables to get started.</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Simple animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)]/10" />
      <div className="absolute top-20 left-10 w-20 h-20 bg-[var(--primary)]/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-[var(--secondary)]/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        <Card className="text-center p-8 border-[var(--primary)]/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-[var(--primary)]/10">
            <GraduationCap className="w-12 h-12 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Sign in to continue your UIL Academy journey</p>
        </Card>
        
        <Card className="p-6 border-[var(--accent)]/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <LoginForm />
        </Card>
      </div>
    </div>
  )
}
