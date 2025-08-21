import { useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  pageLoadTime: number
  domContentLoaded: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
}

export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    domContentLoaded: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
  })

  const measurePerformance = useCallback(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return
    }

    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (perfData) {
      metricsRef.current.pageLoadTime = perfData.loadEventEnd - perfData.loadEventStart
      metricsRef.current.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart
    }

    // Measure First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    if (fcpEntry) {
      metricsRef.current.firstContentfulPaint = fcpEntry.startTime
    }

    // Measure Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          metricsRef.current.largestContentfulPaint = lastEntry.startTime
        }
      })
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP observation not supported')
      }
    }

    // Measure Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value
          }
        }
        metricsRef.current.cumulativeLayoutShift = clsValue
      })
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS observation not supported')
      }
    }
  }, [])

  const logMetrics = useCallback(() => {
    const metrics = metricsRef.current
    console.group('🚀 Performance Metrics')
    console.log('Page Load Time:', metrics.pageLoadTime.toFixed(2), 'ms')
    console.log('DOM Content Loaded:', metrics.domContentLoaded.toFixed(2), 'ms')
    console.log('First Contentful Paint:', metrics.firstContentfulPaint.toFixed(2), 'ms')
    console.log('Largest Contentful Paint:', metrics.largestContentfulPaint.toFixed(2), 'ms')
    console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift.toFixed(3))
    console.groupEnd()

    // Log to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metrics', {
        page_load_time: metrics.pageLoadTime,
        dom_content_loaded: metrics.domContentLoaded,
        first_contentful_paint: metrics.firstContentfulPaint,
        largest_contentful_paint: metrics.largestContentfulPaint,
        cumulative_layout_shift: metrics.cumulativeLayoutShift,
      })
    }
  }, [])

  useEffect(() => {
    measurePerformance()
    
    // Log metrics after a delay to ensure all measurements are complete
    const timer = setTimeout(logMetrics, 1000)
    
    return () => clearTimeout(timer)
  }, [measurePerformance, logMetrics])

  return {
    metrics: metricsRef.current,
    measurePerformance,
    logMetrics,
  }
}

// Hook for optimizing re-renders
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps)
}

// Hook for debouncing expensive operations
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
