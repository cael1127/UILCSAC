import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import SignUpForm from "@/components/sign-up-form"
import FloatingBackground from "@/components/3d/FloatingBackground"
import Card3D from "@/components/3d/Card3D"
import { Rocket, AlertTriangle } from "lucide-react"

// Force dynamic rendering to avoid React Three Fiber SSR issues
export const dynamic = 'force-dynamic'

export default async function SignUpPage() {
  // If Supabase is not configured, show setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
        <FloatingBackground theme="ut-orange" intensity={8} />
        <Card3D className="w-full max-w-md" hoverScale={1.02} glowColor="var(--destructive)">
          <div className="text-center p-8">
            <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="w-16 h-16 text-[var(--destructive)]" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--foreground)]">Setup Required</h1>
            <p className="text-[var(--muted-foreground)]">Please configure your Supabase environment variables to get started.</p>
          </div>
        </Card3D>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 relative overflow-hidden">
      <FloatingBackground theme="ut-orange" intensity={12} />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        <Card3D className="text-center p-8" hoverScale={1.02} glowColor="var(--primary)">
          <div className="mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <Rocket className="w-20 h-20 text-[var(--primary)]" />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Join UIL Academy</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>Create your account to start your UIL competition journey</p>
        </Card3D>
        
        <Card3D hoverScale={1.01} glowColor="var(--accent)">
          <SignUpForm />
        </Card3D>
      </div>
    </div>
  )
}
