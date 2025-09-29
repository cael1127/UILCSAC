// Script to clear authentication state and fix refresh token issues
// Run this in the browser console or as a one-time fix

console.log('Clearing authentication state...')

// Clear Supabase auth tokens
if (typeof window !== 'undefined') {
  // Clear all Supabase-related localStorage items
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key)
      console.log('Removed:', key)
    }
  })
  
  // Clear sessionStorage as well
  const sessionKeys = Object.keys(sessionStorage)
  sessionKeys.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      sessionStorage.removeItem(key)
      console.log('Removed from sessionStorage:', key)
    }
  })
  
  console.log('Authentication state cleared. Please refresh the page and sign in again.')
} else {
  console.log('This script must be run in the browser console.')
}
