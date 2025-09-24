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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not configured')
    }
    
    const cookieStore = await cookies()
    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options)
            } catch (error) {
              // Cookie setting might fail in some contexts, that's okay
              console.warn('Could not set cookie in server component:', name)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', { ...options, maxAge: 0 })
            } catch (error) {
              // Cookie removal might fail in some contexts, that's okay
              console.warn('Could not remove cookie in server component:', name)
            }
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
