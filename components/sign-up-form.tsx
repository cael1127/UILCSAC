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
import { getSiteUrlForPath } from "@/lib/site-url"

export default function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Basic email/password validation
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

    try {
      // Check if email already exists in auth via public 'users' table mirror
      // If you don't mirror auth users to public.users, we can call admin endpoints via Edge Function instead.
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (existingUser) {
        setError("This email is already in use. Try signing in or use a different email.")
        setLoading(false)
        return
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getSiteUrlForPath("/auth/sign-up-confirmation"),
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })

      if (signUpError) {
        const msg = signUpError.message.toLowerCase()
        if (msg.includes('user already registered') || msg.includes('email') && msg.includes('exists')) {
          setError("This email is already in use. Try signing in or use a different email.")
        } else if (msg.includes('weak password')) {
          setError("Password is too weak. Please choose a stronger password.")
        } else {
          setError(signUpError.message)
        }
      } else {
        // Redirect to confirmation page
        router.push("/auth/sign-up-confirmation")
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
        <CardTitle style={{ color: 'var(--foreground)' }}>Create Account</CardTitle>
        <CardDescription style={{ color: 'var(--muted-foreground)' }}>
          Sign up to get started with UIL CS Academy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" style={{ color: 'var(--foreground)' }}>First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ color: 'var(--foreground)' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" style={{ color: 'var(--foreground)' }}>Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{ color: 'var(--foreground)' }}
              />
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" style={{ color: 'var(--foreground)' }}>Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading} style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm space-y-2">
            <div>
              <span style={{ color: 'var(--muted-foreground)' }}>Already have an account? </span>
              <Link href="/auth/login" className="text-[var(--primary)] hover:underline">
                Sign in
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
