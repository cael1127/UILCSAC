import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 })
    }

    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey)

    // Try to get user by email using admin API
    const adminApi: any = (admin as any).auth?.admin
    
    try {
      // First try: getUserByEmail if available
      if (adminApi && 'getUserByEmail' in adminApi && typeof adminApi.getUserByEmail === 'function') {
        const { data, error } = await adminApi.getUserByEmail(email.toLowerCase())
        if (error) {
          // If user not found, that's fine - email doesn't exist
          const notFound = (error as any)?.status === 404 || /not\s*found/i.test((error as any)?.message || "")
          if (notFound) {
            return NextResponse.json({ exists: false })
          }
          // Other errors are real problems
          return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
        }
        // User found
        return NextResponse.json({ exists: !!data?.user })
      }
      
      // Fallback: list users and search
      const { data: listData, error: listError } = await adminApi.listUsers({ page: 1, perPage: 200 })
      if (listError) {
        return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
      }
      
      const found = listData?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
      return NextResponse.json({ exists: !!found })
      
    } catch (err: any) {
      console.error('Email check error:', err)
      return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 })
  }
}


