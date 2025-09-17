import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changefreq: 'weekly', priority: 1 },
    { url: `${baseUrl}/dashboard`, changefreq: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/learning`, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/problems`, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/auth/login`, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/auth/sign-up`, changefreq: 'yearly', priority: 0.3 },
  ]

  if (!isSupabaseConfigured) {
    return staticEntries
  }

  try {
    const supabase = await createClient()

    // Active learning paths
    const { data: paths } = await supabase
      .from('learning_paths')
      .select('id, updated_at')
      .eq('is_active', true)

    // Active modules
    const { data: modules } = await supabase
      .from('path_modules')
      .select('id, learning_path_id, updated_at')
      .eq('is_active', true)

    // Active problems
    const { data: problems } = await supabase
      .from('problems')
      .select('id, updated_at')
      .eq('is_active', true)

    const dynamicEntries: MetadataRoute.Sitemap = []

    if (paths) {
      for (const p of paths) {
        dynamicEntries.push({
          url: `${baseUrl}/learning/${p.id}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
          changefreq: 'weekly',
          priority: 0.8,
        })
      }
    }

    if (modules) {
      for (const m of modules) {
        dynamicEntries.push({
          url: `${baseUrl}/learning/${m.learning_path_id}/module/${m.id}`,
          lastModified: m.updated_at ? new Date(m.updated_at) : undefined,
          changefreq: 'weekly',
          priority: 0.7,
        })
      }
    }

    if (problems) {
      for (const pr of problems) {
        dynamicEntries.push({
          url: `${baseUrl}/problems/${pr.id}/practice`,
          lastModified: pr.updated_at ? new Date(pr.updated_at) : undefined,
          changefreq: 'weekly',
          priority: 0.7,
        })
      }
    }

    return [...staticEntries, ...dynamicEntries]
  } catch {
    return staticEntries
  }
}


