"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, BookOpen, Code, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-[var(--primary)]">404</span>
        </div>
        
        {/* Error Message */}
        <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          Page Not Found
        </h1>
        <p className="mb-8" style={{ color: 'var(--muted-foreground)' }}>
          Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        {/* Quick Actions */}
        <div className="space-y-4 mb-8">
          <Button asChild className="w-full" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)]">
              <Link href="/learning">
                <BookOpen className="h-4 w-4 mr-2" />
                Learning
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--muted-foreground)]">
              <Link href="/dashboard">
                <Code className="h-4 w-4 mr-2" />
                Problems
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
