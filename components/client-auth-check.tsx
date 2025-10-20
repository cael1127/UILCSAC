"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { AuthError } from '@supabase/supabase-js'
import { handleAuthErrorWithRecovery, clearAuthSession } from '@/lib/auth-error-handler'
import { useAuthErrorHandler } from './auth/AuthErrorBoundary'

// Simple CSS loading spinner
const AuthLoadingSpinner = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
    {message && <p className="text-sm text-[var(--muted-foreground)]">{message}</p>}
  </div>
)

export default function ClientAuthCheck() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [authError, setAuthError] = useState<AuthError | null>(null)
  const { triggerAuthError } = useAuthErrorHandler()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth check error:', error)
          
          // Handle specific auth errors
          if (error instanceof AuthError) {
            const recovered = await handleAuthErrorWithRecovery(error)
            if (!recovered) {
              setAuthError(error)
              triggerAuthError(error)
            }
          }
          return
        }
        
        // If no session and we're on a protected route, redirect to login
        if (!session) {
          const currentPath = window.location.pathname
          const protectedRoutes = ['/dashboard', '/learning', '/problems', '/practice-test']
          
          if (protectedRoutes.some(route => currentPath.startsWith(route))) {
            router.push('/auth/login')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        
        // Handle unexpected errors
        if (error instanceof AuthError) {
          setAuthError(error)
          triggerAuthError(error)
        }
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_OUT') {
          const currentPath = window.location.pathname
          const protectedRoutes = ['/dashboard', '/learning', '/problems', '/practice-test']
          
          if (protectedRoutes.some(route => currentPath.startsWith(route))) {
            router.push('/auth/login')
          }
        } else if (event === 'TOKEN_REFRESHED') {
          // Token was successfully refreshed
          console.log('Token refreshed successfully')
        } else if (event === 'SIGNED_IN') {
          // User signed in successfully
          console.log('User signed in successfully')
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        
        if (error instanceof AuthError) {
          const recovered = await handleAuthErrorWithRecovery(error)
          if (!recovered) {
            setAuthError(error)
            triggerAuthError(error)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [router, triggerAuthError])

  // Handle manual session refresh
  const handleRefreshSession = async () => {
    setIsChecking(true)
    setAuthError(null)
    
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Session refresh error:', error)
        if (error instanceof AuthError) {
          setAuthError(error)
          triggerAuthError(error)
        }
      } else {
        console.log('Session refreshed successfully')
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      if (error instanceof AuthError) {
        setAuthError(error)
        triggerAuthError(error)
      }
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking) {
    return <AuthLoadingSpinner message="Checking authentication..." />
  }

  if (authError) {
    return (
      <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-[var(--destructive)]/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              Authentication Error
            </h3>
            <p className="text-[var(--muted-foreground)] text-sm">
              Your session has expired. Please sign in again.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleRefreshSession}
                className="flex-1 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  clearAuthSession()
                  router.push('/auth/login')
                }}
                className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-md text-sm font-medium hover:bg-[var(--muted)] transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}