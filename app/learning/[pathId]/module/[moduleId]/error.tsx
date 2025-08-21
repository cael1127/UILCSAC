"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LearningModuleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Learning module error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Something went wrong!</CardTitle>
            <CardDescription className="text-base">
              We encountered an error while loading the learning module
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  The learning module couldn't be loaded. This might be due to:
                </p>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• The module doesn't exist</li>
                  <li>• You don't have access to this module</li>
                  <li>• A temporary server error</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={reset} className="w-full">
                Try Again
              </Button>
              
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
