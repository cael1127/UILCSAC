import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    // Only proceed if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return supabaseResponse
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Set the cookie in the request for immediate use
            request.cookies.set({
              name,
              value,
              ...options,
            })
            // Set the cookie in the response for future requests
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            supabaseResponse.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            // Remove the cookie from the request
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            // Remove the cookie from the response
            supabaseResponse = NextResponse.next({
              request: {
                headers: request.headers,
              },
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

    // Refresh the session if it exists
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Handle auth callback
    const url = new URL(request.url)
    if (url.pathname === "/auth/callback") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redirect to login if accessing protected routes without authentication
    if (!user && (
      url.pathname.startsWith('/dashboard') ||
      url.pathname.startsWith('/learning') ||
      url.pathname.startsWith('/problems') ||
      url.pathname.startsWith('/practice-test')
    )) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Redirect authenticated users away from auth pages
    if (user && (
      url.pathname.startsWith('/auth/login') ||
      url.pathname.startsWith('/auth/sign-up')
    )) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
  } catch (error) {
    console.error('Middleware error:', error)
    return supabaseResponse
  }
}
