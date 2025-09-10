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

    // Prefer direct admin email lookup if available; fallback to listUsers filter
    const tryGetByEmail = async () => {
      const adminApi: any = (admin as any).auth?.admin
      if (adminApi && 'getUserByEmail' in adminApi && typeof adminApi.getUserByEmail === 'function') {
        return await adminApi.getUserByEmail(email.toLowerCase())
      }
      // Fallback: list first 200 users and search (last resort in older SDKs)
      const list = await adminApi.listUsers({ page: 1, perPage: 200 })
      const found = list.data?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
      return { data: { user: found || null }, error: null }
    }

    const { data, error } = await tryGetByEmail()
    if (error) {
      // If endpoint returns not found, treat as not existing
      const notFound = (error as any)?.status === 404 || /not\s*found/i.test((error as any)?.message || "")
      if (!notFound) {
        return NextResponse.json({ error: "Lookup failed" }, { status: 500 })
      }
    }

    const exists = !!data?.user
    return NextResponse.json({ exists })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 })
  }
}


