/**
 * Get the site URL with proper fallbacks for different environments
 * Priority: NEXT_PUBLIC_SITE_URL > URL > DEPLOY_PRIME_URL > localhost
 */
export function getSiteUrl(): string {
  // Prefer runtime origin in the browser to avoid localhost in emails
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.URL ||
    process.env.DEPLOY_PRIME_URL ||
    'http://localhost:3000'
  )
}

/**
 * Get the site URL for a specific path
 */
export function getSiteUrlForPath(path: string): string {
  const baseUrl = getSiteUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}
