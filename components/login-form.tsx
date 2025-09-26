"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in and redirect if so
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push("/dashboard")
        router.refresh()
      }
    }
    
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Basic client-side email/password validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.")
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error types
        if (error.message.includes('429') || error.message.toLowerCase().includes('rate limit')) {
          setError("Too many login attempts. Please wait a few minutes and try again.")
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials.")
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          setError("Please confirm your email before signing in.")
        } else {
          setError("Invalid email or password. Please check your credentials.")
        }
      } else {
        // Sign in successful - redirect to dashboard
        console.log("Sign in successful, redirecting to dashboard")
        router.push("/dashboard")
        router.refresh() // Force a refresh to update auth state
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in hover-lift">
      <CardHeader className="text-center">
        <CardTitle style={{ color: 'var(--foreground)' }} className="text-xl sm:text-2xl font-bold">
          Welcome Back
        </CardTitle>
        <CardDescription style={{ color: 'var(--muted-foreground)' }} className="text-sm sm:text-base">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-bounce-in">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          


          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: 'var(--foreground)' }} className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ color: 'var(--foreground)' }}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: 'var(--foreground)' }} className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ color: 'var(--foreground)' }}
              className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full btn-interactive group" 
            disabled={loading} 
            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </>
            )}
          </Button>

          <div className="text-center text-sm space-y-3">
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Don't have an account? </span>
              <Link 
                href="/auth/sign-up" 
                className="text-[var(--primary)] hover:underline transition-all duration-300 hover:text-[var(--accent)]"
              >
                Sign up
              </Link>
            </div>
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Already logged in? </span>
              <Link 
                href="/dashboard" 
                className="text-[var(--primary)] hover:underline transition-all duration-300 hover:text-[var(--accent)]"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
