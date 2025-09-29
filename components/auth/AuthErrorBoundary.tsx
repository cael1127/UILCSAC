"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthError } from '@supabase/supabase-js'
import { handleAuthError, clearAuthSession } from '@/lib/auth-error-handler'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react'

interface AuthErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  const [error, setError] = useState<AuthError | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Listen for auth errors
    const handleError = (event: CustomEvent) => {
      if (event.detail instanceof AuthError) {
        setError(event.detail)
      }
    }

    window.addEventListener('auth-error', handleError as EventListener)
    return () => window.removeEventListener('auth-error', handleError as EventListener)
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    setError(null)
    
    // Wait a moment before retrying
    setTimeout(() => {
      setIsRetrying(false)
    }, 1000)
  }

  const handleSignOut = async () => {
    await clearAuthSession()
    router.push('/auth/login')
  }

  if (error) {
    const errorInfo = handleAuthError(error)
    
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-[var(--destructive)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-[var(--destructive)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Authentication Error
            </h1>
            <p className="text-[var(--muted-foreground)]">
              {errorInfo.message}
            </p>
          </div>

          <Alert className="border-[var(--destructive)]/20 bg-[var(--destructive)]/5">
            <AlertCircle className="h-4 w-4 text-[var(--destructive)]" />
            <AlertDescription className="text-[var(--destructive)]">
              Error Code: {errorInfo.code}
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook to trigger auth error handling
export function useAuthErrorHandler() {
  const triggerAuthError = (error: AuthError) => {
    const event = new CustomEvent('auth-error', { detail: error })
    window.dispatchEvent(event)
  }

  return { triggerAuthError }
}
