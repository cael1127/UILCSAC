"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { clearAuthSession } from '@/lib/auth-error-handler'

export default function ClearSessionPage() {
  const [isClearing, setIsClearing] = useState(false)
  const [isCleared, setIsCleared] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClearSession = async () => {
    setIsClearing(true)
    setError(null)
    
    try {
      // Clear Supabase session
      await supabase.auth.signOut()
      
      // Clear additional auth data
      await clearAuthSession()
      
      // Clear any additional localStorage items
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear sessionStorage
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
            sessionStorage.removeItem(key)
          }
        })
      }
      
      setIsCleared(true)
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
      
    } catch (err) {
      console.error('Error clearing session:', err)
      setError('Failed to clear session. Please try again.')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-[var(--primary)]" />
          </div>
          <CardTitle className="text-2xl">Clear Session</CardTitle>
          <CardDescription>
            This will clear your authentication session and fix any token issues.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-[var(--destructive)]/20 bg-[var(--destructive)]/5">
              <AlertCircle className="h-4 w-4 text-[var(--destructive)]" />
              <AlertDescription className="text-[var(--destructive)]">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {isCleared ? (
            <Alert className="border-[var(--success)]/20 bg-[var(--success)]/5">
              <CheckCircle className="h-4 w-4 text-[var(--success)]" />
              <AlertDescription className="text-[var(--success)]">
                Session cleared successfully! Redirecting to login...
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                If you're experiencing authentication errors like "Invalid Refresh Token", 
                this will clear your session and allow you to sign in again.
              </p>
              
              <Button 
                onClick={handleClearSession}
                disabled={isClearing}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isClearing ? 'animate-spin' : ''}`} />
                {isClearing ? 'Clearing Session...' : 'Clear Session & Sign Out'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/auth/login')}
                className="w-full"
              >
                Go to Login Instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
