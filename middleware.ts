import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Temporarily disable middleware to avoid build issues
     * Only match auth callback for now
     */
    "/auth/callback",
  ],
}

// Note: Using default runtime to avoid Edge Runtime issues with Supabase
