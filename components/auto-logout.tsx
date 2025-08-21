"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function AutoLogout() {
  useEffect(() => {
    const handleAutoLogout = async () => {
      try {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('Auto-logout: User session found, signing out...')
          await supabase.auth.signOut()
          console.log('Auto-logout: User signed out successfully')
        }
      } catch (error) {
        console.error('Auto-logout error:', error)
      }
    }

    // Run auto-logout when component mounts (page loads)
    handleAutoLogout()
  }, [])

  // This component doesn't render anything visible
  return null
}
