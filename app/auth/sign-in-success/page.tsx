"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2 } from "lucide-react"

export default function SignInSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-6">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription className="text-base">
              You've successfully signed in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your dashboard...
                </p>
                <p className="text-xs text-muted-foreground">
                  If you're not redirected automatically, click the button below.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
