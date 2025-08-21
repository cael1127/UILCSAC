import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AutoLogout from "@/components/auto-logout"
import ThemeSwitcher from "@/components/theme-switcher"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Auto-logout component */}
      <AutoLogout />
      
      {/* Theme Switcher */}
      <ThemeSwitcher />
      
      {/* Hero Section */}
      <div className="gradient-ut text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            UIL CS Academy
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
            Master competitive programming with our comprehensive platform designed for UIL Computer Science competitions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-foreground">
              <Link href="/auth/login">Start Learning</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose UIL CS Academy?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and resources to excel in competitive programming
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-ut hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <CardTitle>Web-Based Java Execution</CardTitle>
                <CardDescription>
                  Write, test, and run Java code directly in your browser without local installation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Practice coding problems with instant feedback and real-time execution. Perfect for learning and competition preparation.
                </p>
              </CardContent>
            </Card>

            <Card className="card-ut hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <CardTitle>Structured Learning Paths</CardTitle>
                <CardDescription>
                  Progressive curriculum designed specifically for UIL competition success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Follow carefully crafted learning modules that build your skills from fundamentals to advanced competitive programming techniques.
                </p>
              </CardContent>
            </Card>

            <Card className="card-ut hover-lift">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <CardTitle>Competition Practice</CardTitle>
                <CardDescription>
                  Extensive problem database with real UIL-style questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access hundreds of practice problems with varying difficulty levels to prepare for any UIL Computer Science competition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-background mb-6">
            Ready to Dominate UIL Competitions?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who have improved their competitive programming skills with our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/auth/sign-up">Start Free Today</Link>
              </Button>
            <Button asChild variant="outline" size="lg" className="border-muted-foreground text-muted-foreground hover:bg-muted-foreground hover:text-background">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 UIL CS Academy. Built for competitive programming excellence.
          </p>
        </div>
      </footer>
    </div>
  )
}
