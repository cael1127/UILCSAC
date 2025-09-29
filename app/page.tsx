import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AutoLogout from "@/components/auto-logout"
import FloatingBackground from "@/components/3d/FloatingBackground"
import Card3D from "@/components/3d/Card3D"
import { 
  Code, 
  BookOpen, 
  Trophy, 
  Zap, 
  Users, 
  Target,
  ArrowRight,
  Play,
  CheckCircle
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      <AutoLogout />
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        {/* 3D Floating Background */}
        <FloatingBackground theme="ut-orange" intensity={12} />
        
        {/* Dynamic Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)]/10" />
        
        {/* Enhanced Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[var(--primary)]/20 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-[var(--accent)]/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-[var(--secondary)]/20 rounded-full blur-xl animate-pulse delay-2000" />
        
        <div className="container-modern py-20 lg:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-modern-lg">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-6 py-3 text-sm font-medium text-[var(--primary)] animate-fade-in hover-lift">
              <Zap className="mr-2 h-4 w-4" />
              Enhanced Java Runtime Now Available
            </div>
            
            {/* Enhanced Title */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-8xl animate-slide-up" style={{ color: 'var(--foreground)' }}>
              Master All UIL Competitions
            </h1>
            
            {/* Enhanced Subtitle */}
            <p className="mx-auto max-w-3xl text-xl sm:text-2xl animate-slide-up leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              The most comprehensive platform for all UIL competitions. 
              Master Computer Science, Mathematics, Science, Literature, and Spelling with structured learning paths and expert-curated content.
            </p>
            
            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up mt-8">
              <Button asChild size="lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href="/auth/sign-up" className="flex items-center px-8 py-4 text-lg" style={{ color: 'var(--primary-foreground)' }}>
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-outline hover-lift" style={{ color: 'var(--foreground)' }}>
                <Link href="/auth/login" className="flex items-center px-8 py-4 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 lg:py-32 bg-[var(--muted)]/30">
        <div className="container-modern">
          <div className="text-center space-modern-lg mb-20">
            <h2 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Everything You Need to Excel
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-[var(--muted-foreground)]">
              Comprehensive tools and resources designed specifically for UIL competition success
            </p>
          </div>
          
          <div className="grid-modern grid-modern-3">
            <Card3D className="h-full" hoverScale={1.08} glowColor="var(--primary)">
              <CardHeader className="space-modern-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 group-hover:bg-[var(--primary)]/20 transition-colors duration-300">
                  <Code className="h-8 w-8 text-[var(--primary)]" />
                </div>
                <CardTitle className="text-xl text-[var(--foreground)]">Multi-Subject Platform</CardTitle>
                <CardDescription className="text-[var(--muted-foreground)]">
                  Master all UIL subjects in one platform: Computer Science with Java runtime, Mathematics with mental math tools, Science with formula support, Literature analysis, and Spelling practice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-modern-sm text-sm text-[var(--muted-foreground)]">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    5 UIL subjects covered
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Unified progress tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Subject-specific tools
                  </li>
                </ul>
              </CardContent>
            </Card3D>

            <Card3D className="h-full" hoverScale={1.08} glowColor="var(--accent)">
              <CardHeader className="space-modern-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 transition-colors duration-300">
                  <BookOpen className="h-8 w-8 text-[var(--accent)]" />
                </div>
                <CardTitle className="text-xl text-[var(--foreground)]">Structured Learning</CardTitle>
                <CardDescription className="text-[var(--muted-foreground)]">
                  Progressive curriculum designed by UIL competition experts to build skills from fundamentals to advanced techniques.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-modern-sm text-sm text-[var(--muted-foreground)]">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Step-by-step modules
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Expert-curated content
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Progress tracking
                  </li>
                </ul>
              </CardContent>
            </Card3D>

            <Card3D className="h-full" hoverScale={1.08} glowColor="var(--warning)">
              <CardHeader className="space-modern-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--warning)]/10 group-hover:bg-[var(--warning)]/20 transition-colors duration-300">
                  <Trophy className="h-8 w-8 text-[var(--warning)]" />
                </div>
                <CardTitle className="text-xl text-[var(--foreground)]">Competition Ready</CardTitle>
                <CardDescription className="text-[var(--muted-foreground)]">
                  Extensive problem database with real UIL-style questions and comprehensive test cases to prepare for any competition.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-modern-sm text-sm text-[var(--muted-foreground)]">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    UIL-style problems
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Multiple difficulty levels
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-[var(--success)]" />
                    Comprehensive test cases
                  </li>
                </ul>
              </CardContent>
            </Card3D>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
        <div className="container-modern">
          <div className="grid-modern grid-modern-3 text-center">
            <div className="space-modern-sm p-6 rounded-2xl bg-[var(--card)]/50 hover-lift">
              <div className="text-5xl font-bold text-[var(--primary)] mb-2">5</div>
              <div className="text-[var(--muted-foreground)] text-lg">UIL Subjects</div>
            </div>
            <div className="space-modern-sm p-6 rounded-2xl bg-[var(--card)]/50 hover-lift">
              <div className="text-5xl font-bold text-[var(--primary)] mb-2">25+</div>
              <div className="text-[var(--muted-foreground)] text-lg">Learning Paths</div>
            </div>
            <div className="space-modern-sm p-6 rounded-2xl bg-[var(--card)]/50 hover-lift">
              <div className="text-5xl font-bold text-[var(--primary)] mb-2">24/7</div>
              <div className="text-[var(--muted-foreground)] text-lg">Available Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--background)] to-[var(--accent)]/10" />
        <div className="absolute top-10 right-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl" />
        
        <div className="container-modern relative z-10">
          <div className="mx-auto max-w-5xl text-center space-modern-lg">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl" style={{ color: 'var(--foreground)' }}>
              Ready to Dominate UIL Competitions?
            </h2>
            <p className="mx-auto max-w-3xl text-xl" style={{ color: 'var(--muted-foreground)' }}>
              Join thousands of students who have improved their UIL competition skills with our platform. 
              Start your journey to competition success today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
              <Button asChild size="lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                <Link href="/auth/sign-up" className="flex items-center px-8 py-4 text-lg" style={{ color: 'var(--primary-foreground)' }}>
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" style={{ color: 'var(--primary-foreground)' }} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-outline hover-lift" style={{ color: 'var(--foreground)' }}>
                <Link href="/auth/login" className="px-8 py-4 text-lg">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--muted)]/30">
        <div className="container-modern py-16">
          <div className="text-center space-modern-sm">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                <Code className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <span className="text-2xl font-bold text-[var(--foreground)]">UIL Academy</span>
            </div>
            <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
              Built for UIL competition excellence. Empowering students across all academic disciplines.
            </p>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="text-sm text-[var(--muted-foreground)]">
                © 2024 UIL Academy. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
