import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

// Use static generation with revalidation for better reliability
// This prevents 502 errors from Google Search Console
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  // Core static entries that are always available
  const staticEntries: MetadataRoute.Sitemap = [
    { 
      url: `${baseUrl}/`, 
      lastModified: new Date(),
      changeFrequency: 'weekly', 
      priority: 1 
    },
    { 
      url: `${baseUrl}/dashboard`, 
      lastModified: new Date(),
      changeFrequency: 'weekly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/learning`, 
      lastModified: new Date(),
      changeFrequency: 'weekly', 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/problems`, 
      lastModified: new Date(),
      changeFrequency: 'weekly', 
      priority: 0.9 
    },
    { 
      url: `${baseUrl}/practice-test`, 
      lastModified: new Date(),
      changeFrequency: 'weekly', 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/auth/login`, 
      lastModified: new Date(),
      changeFrequency: 'yearly', 
      priority: 0.3 
    },
    { 
      url: `${baseUrl}/auth/sign-up`, 
      lastModified: new Date(),
      changeFrequency: 'yearly', 
      priority: 0.3 
    },
  ]

  // Return static entries only to ensure sitemap is always accessible
  // Dynamic content can be discovered through regular crawling
  return staticEntries
}


