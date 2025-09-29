import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only match auth callback to avoid Edge Runtime issues with Supabase
     */
    "/auth/callback",
  ],
}

// Explicitly use Node.js runtime instead of Edge Runtime
export const runtime = 'nodejs'
