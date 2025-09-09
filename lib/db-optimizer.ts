import { supabase } from './supabase/client'

// Cache interface for storing query results
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class QueryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

// Global cache instance
const queryCache = new QueryCache()

// Optimized query functions
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer
  private cache = queryCache

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer()
    }
    return DatabaseOptimizer.instance
  }

  // Optimized query with caching
  async queryWithCache<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    cacheKey: string,
    ttl: number = 5 * 60 * 1000
  ): Promise<{ data: T | null; error: any }> {
    // Check cache first
    const cached = this.cache.get<T>(cacheKey)
    if (cached) {
      console.log(`Cache hit for key: ${cacheKey}`)
      return { data: cached, error: null }
    }

    // Execute query
    console.log(`Cache miss for key: ${cacheKey}, executing query...`)
    const result = await queryFn()
    
    // Cache successful results
    if (result.data && !result.error) {
      this.cache.set(cacheKey, result.data, ttl)
    }

    return result
  }

  // Batch multiple queries for efficiency
  async batchQuery<T>(
    queries: Array<{
      key: string
      queryFn: () => Promise<{ data: T | null; error: any }>
      ttl?: number
    }>
  ): Promise<Record<string, { data: T | null; error: any }>> {
    const results: Record<string, { data: T | null; error: any }> = {}
    
    // Execute queries in parallel
    const promises = queries.map(async ({ key, queryFn, ttl }) => {
      const result = await this.queryWithCache(queryFn, key, ttl)
      results[key] = result
    })

    await Promise.all(promises)
    return results
  }

  // Prefetch data for better user experience
  async prefetchData<T>(
    cacheKey: string,
    queryFn: () => Promise<{ data: T | null; error: any }>,
    ttl: number = 5 * 60 * 1000
  ): Promise<void> {
    // Don't wait for the result, just start the query
    this.queryWithCache(queryFn, cacheKey, ttl).catch(error => {
      console.warn('Prefetch failed:', error)
    })
  }

  // Clear specific cache entries
  clearCache(pattern?: string): void {
    if (pattern) {
      // Clear entries matching pattern
      for (const key of this.cache.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }
}

// Specific optimized queries for common operations
export const optimizedQueries = {
  // Get learning paths with caching
  async getLearningPaths() {
    const optimizer = DatabaseOptimizer.getInstance()
    return optimizer.queryWithCache(
      () => supabase.from('learning_paths').select('*').order('order_index'),
      'learning_paths',
      10 * 60 * 1000 // 10 minutes cache
    )
  },

  // Get module with questions (batched)
  async getModuleWithQuestions(moduleId: string) {
    const optimizer = DatabaseOptimizer.getInstance()
    
    const queries = [
      {
        key: `module_${moduleId}`,
        queryFn: () => supabase.from('path_modules').select('*').eq('id', moduleId).single(),
        ttl: 5 * 60 * 1000
      },
      {
        key: `questions_${moduleId}`,
        queryFn: () => supabase
          .from('questions')
          .select(`
            *
          `)
          .eq('module_id', moduleId)
          .eq('is_active', true)
          .order('order_index'),
        ttl: 5 * 60 * 1000
      }
    ]

    return optimizer.batchQuery(queries)
  },

  // Get question options with caching
  async getQuestionOptions(questionIds: string[]) {
    const optimizer = DatabaseOptimizer.getInstance()
    
    // Batch all question options queries
    const queries = questionIds.map(questionId => ({
      key: `options_${questionId}`,
      queryFn: () => supabase
        .from('question_options')
        .select('*')
        .eq('question_id', questionId)
        .order('order_index'),
      ttl: 5 * 60 * 1000
    }))

    return optimizer.batchQuery(queries)
  }
}

// Export the optimizer instance
export const dbOptimizer = DatabaseOptimizer.getInstance()
