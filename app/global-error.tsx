'use client'

import { useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            
            {/* Error Message */}
            <h1 className="text-3xl font-bold text-smoky-black mb-4">
              Something went wrong!
            </h1>
            <p className="text-dim-gray mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem persists.
            </p>
            
            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-dim-gray hover:text-smoky-black mb-2">
                  Error Details
                </summary>
                <div className="bg-white border border-slate-gray/20 rounded p-3 text-xs font-mono text-smoky-black overflow-auto">
                  <div className="text-dim-gray mb-1">Message:</div>
                  <div className="mb-2">{error.message}</div>
                  {error.digest && (
                    <>
                      <div className="text-dim-gray mb-1">Digest:</div>
                      <div className="mb-2">{error.digest}</div>
                    </>
                  )}
                  <div className="text-dim-gray mb-1">Stack:</div>
                  <div className="text-xs">{error.stack}</div>
                </div>
              </details>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={reset}
                className="w-full bg-ut-orange hover:bg-ut-orange/90 text-smoky-black font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button asChild variant="outline" className="w-full border-slate-gray text-slate-gray hover:bg-slate-gray hover:text-white">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
            </div>
            
            {/* Support Info */}
            <div className="mt-8 text-sm text-dim-gray">
              <p>If this error continues, please contact support with:</p>
              <p className="font-mono text-xs mt-2 bg-white border border-slate-gray/20 rounded px-2 py-1">
                Error ID: {error.digest || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
