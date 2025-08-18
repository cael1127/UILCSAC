import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Trophy, BarChart3, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl">
                <Code2 className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">UIL CS Academy</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Master competitive programming with our comprehensive platform designed for UIL Computer Science
              competitions. Practice problems, track progress, and excel in competitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-card-foreground mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need to excel in UIL Computer Science competitions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border bg-background">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Practice Problems</CardTitle>
                <CardDescription>
                  Extensive collection of UIL-style problems with detailed explanations and test cases.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-background">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mb-4">
                  <Trophy className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Competition Ready</CardTitle>
                <CardDescription>
                  Timed practice sessions that simulate real UIL competition environments.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-background">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Progress Analytics</CardTitle>
                <CardDescription>
                  Track your improvement with detailed analytics and performance insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border bg-background">
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 bg-secondary/10 rounded-lg mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Teacher Tools</CardTitle>
                <CardDescription>
                  Comprehensive tools for teachers to manage students and track class progress.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start your journey?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students already improving their competitive programming skills.
          </p>
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/auth/sign-up">Create Your Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
