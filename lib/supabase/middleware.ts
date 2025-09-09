import { NextResponse, type NextRequest } from "next/server"

// Edge-safe minimal middleware that avoids importing supabase-js
// This prevents Edge runtime build failures on Netlify.
export async function updateSession(request: NextRequest) {
  // Optional: handle auth callback by simple redirect (session exchange handled elsewhere)
  const url = new URL(request.url)
  if (url.pathname === "/auth/callback") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}
