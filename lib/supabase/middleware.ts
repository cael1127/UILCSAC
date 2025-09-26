import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    // Only proceed if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            supabaseResponse.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Handle auth callback
    const url = new URL(request.url)
    if (url.pathname === "/auth/callback") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Simple route protection without auth check to avoid Edge Runtime issues
    const protectedRoutes = ['/dashboard', '/learning', '/problems', '/practice-test']
    const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route))
    
    if (isProtectedRoute) {
      // Check for auth token in cookies instead of making API call
      const authToken = request.cookies.get('sb-access-token')?.value
      if (!authToken) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    // Redirect authenticated users away from auth pages
    const authRoutes = ['/auth/login', '/auth/sign-up']
    const isAuthRoute = authRoutes.some(route => url.pathname.startsWith(route))
    
    if (isAuthRoute) {
      const authToken = request.cookies.get('sb-access-token')?.value
      if (authToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    return supabaseResponse
  } catch (error) {
    // Return next response on any error to avoid breaking the app
    return NextResponse.next()
  }
}
