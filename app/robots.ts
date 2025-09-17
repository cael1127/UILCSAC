import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()
  const sitemapUrl = `${baseUrl}/sitemap.xml`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/callback',
          '/app/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: sitemapUrl,
    host: baseUrl,
  }
}


