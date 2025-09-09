import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { cache } from "react"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a cached version of the Supabase client for Server Components
export const createClient = cache(async (): Promise<any> => {
  if (!isSupabaseConfigured) {
    // Return a permissive dummy client typed as any to satisfy build-time types
    const noData = Promise.resolve({ data: null, error: null })
    const chain = {
      select: () => ({ eq: () => ({ single: () => noData }) }),
      eq: () => ({ single: () => noData }),
      order: () => ({ limit: () => ({ single: () => noData }) }),
      gt: () => ({ order: () => ({ limit: () => ({ single: () => noData }) }) }),
      insert: () => ({ select: () => ({ single: () => noData }) }),
      upsert: () => ({ select: () => ({ single: () => noData }) }),
      update: () => ({ eq: () => noData }),
    }
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => chain,
    } as any
  }

  try {
    const cookieStore = await cookies()
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
  } catch (error) {
    console.error("Error creating Supabase client:", error)
    // Return a dummy client as fallback
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    }
  }
})
