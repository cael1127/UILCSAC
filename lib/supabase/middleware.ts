import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  const res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if this is an auth callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
    // Redirect to dashboard after successful auth
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  // Define route patterns
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up-confirmation") ||
    request.nextUrl.pathname.startsWith("/auth/sign-in-success") ||
    request.nextUrl.pathname === "/auth/callback"

  const isPublicRoute = request.nextUrl.pathname === "/"
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/")
  const isStaticRoute = request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/favicon.ico")

  // Skip middleware for static and API routes
  if (isStaticRoute || isApiRoute) {
    return res
  }

  // For auth routes, don't check authentication
  if (isAuthRoute) {
    return res
  }

  // For public routes, allow access but don't redirect
  if (isPublicRoute) {
    return res
  }

  // For all other routes, check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}
