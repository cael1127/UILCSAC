"use client"

import { AuthError, PostgrestError } from "@supabase/supabase-js"
import { handleAuthError } from "../auth-error-handler"

export function handleSupabaseError(error: AuthError | PostgrestError | Error): void {
  console.error("Supabase Error:", error)

  if (error instanceof AuthError) {
    // Handle authentication errors
    const errorInfo = handleAuthError(error)
    
    // Dispatch custom event for error boundary to catch
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('auth-error', { detail: error })
      window.dispatchEvent(event)
    }
  } else if (error instanceof Error && 'code' in error) {
    // Handle PostgrestError
    const pgError = error as PostgrestError
    console.error("Database Error:", {
      code: pgError.code,
      message: pgError.message,
      details: pgError.details,
      hint: pgError.hint
    })
    
    // You can add specific handling for database errors here
    if (pgError.code === 'PGRST116') {
      console.warn("No rows returned from query")
    }
  } else {
    // Handle generic errors
    console.error("Unexpected error:", error)
  }
}

export function createErrorHandler() {
  return {
    handleError: handleSupabaseError,
    handleAuthError: (error: AuthError) => {
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('auth-error', { detail: error })
        window.dispatchEvent(event)
      }
    }
  }
}
