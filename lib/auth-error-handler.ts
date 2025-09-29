"use client"

import { AuthError } from "@supabase/supabase-js"
import { supabase } from "./supabase/client"

export interface AuthErrorInfo {
  message: string
  code: string
  shouldRedirect: boolean
  redirectTo: string
}

export function handleAuthError(error: AuthError): AuthErrorInfo {
  console.error("Auth Error:", error)
  
  switch (error.message) {
    case "Invalid Refresh Token: Refresh Token Not Found":
    case "Invalid Refresh Token: Refresh Token is expired":
    case "Invalid Refresh Token: Refresh Token is revoked":
      return {
        message: "Your session has expired. Please sign in again.",
        code: "REFRESH_TOKEN_INVALID",
        shouldRedirect: true,
        redirectTo: "/auth/login"
      }
    
    case "Invalid JWT: JWT is expired":
    case "Invalid JWT: JWT is malformed":
      return {
        message: "Your session is invalid. Please sign in again.",
        code: "JWT_INVALID",
        shouldRedirect: true,
        redirectTo: "/auth/login"
      }
    
    case "Email not confirmed":
      return {
        message: "Please check your email and confirm your account.",
        code: "EMAIL_NOT_CONFIRMED",
        shouldRedirect: true,
        redirectTo: "/auth/sign-up-confirmation"
      }
    
    case "Invalid login credentials":
      return {
        message: "Invalid email or password. Please try again.",
        code: "INVALID_CREDENTIALS",
        shouldRedirect: false,
        redirectTo: ""
      }
    
    case "User not found":
      return {
        message: "No account found with this email address.",
        code: "USER_NOT_FOUND",
        shouldRedirect: false,
        redirectTo: ""
      }
    
    default:
      return {
        message: "An authentication error occurred. Please try again.",
        code: "UNKNOWN_ERROR",
        shouldRedirect: false,
        redirectTo: ""
      }
  }
}

export async function clearAuthSession(): Promise<void> {
  try {
    // Clear Supabase session
    await supabase.auth.signOut()
    
    // Clear any additional auth-related localStorage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token')
    }
  } catch (error) {
    console.error("Error clearing auth session:", error)
  }
}

export async function refreshAuthSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error("Error refreshing session:", error)
      return false
    }
    
    return !!data.session
  } catch (error) {
    console.error("Error refreshing session:", error)
    return false
  }
}

export async function handleAuthErrorWithRecovery(error: AuthError): Promise<boolean> {
  const errorInfo = handleAuthError(error)
  
  // Try to refresh the session for refresh token errors
  if (errorInfo.code === "REFRESH_TOKEN_INVALID") {
    const refreshed = await refreshAuthSession()
    if (refreshed) {
      return true // Session was successfully refreshed
    }
  }
  
  // If we can't recover, clear the session
  if (errorInfo.shouldRedirect) {
    await clearAuthSession()
    
    // Redirect to the appropriate page
    if (typeof window !== 'undefined') {
      window.location.href = errorInfo.redirectTo
    }
  }
  
  return false
}
