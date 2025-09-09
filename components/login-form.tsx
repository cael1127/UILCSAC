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
    // Check if user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Don't auto-redirect, let user choose to stay or go to dashboard
        console.log("User already has an active session")
      }
    }
    
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error types
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          setError("Too many login attempts. Please wait a few minutes and try again.")
        } else if (error.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. Please check your credentials.")
        } else {
          setError(error.message)
        }
      } else {
        // Redirect to success page
        router.push("/auth/sign-in-success")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle style={{ color: 'var(--foreground)' }}>Sign In</CardTitle>
        <CardDescription style={{ color: 'var(--muted-foreground)' }}>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          


          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: 'var(--foreground)' }}>Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: 'var(--foreground)' }}>Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm space-y-2">
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Don't have an account? </span>
              <Link href="/auth/sign-up" className="text-[var(--primary)] hover:underline">
                Sign up
              </Link>
            </div>
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Already logged in? </span>
              <Link href="/dashboard" className="text-[var(--primary)] hover:underline">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
