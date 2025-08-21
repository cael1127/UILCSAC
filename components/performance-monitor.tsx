"use client"

import { useEffect, useState } from 'react'
import { usePerformance } from '@/hooks/use-performance'

export function PerformanceMonitor() {
  const { metrics } = usePerformance()
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development mode
  useEffect(() => {
    setIsVisible(process.env.NODE_ENV === 'development')
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-smoky-black/90 text-ivory p-3 rounded-lg text-xs font-mono z-50 max-w-xs border border-ut-orange/30 shadow-lg">
      <div className="font-bold mb-2 text-ut-orange">🚀 Performance</div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Page Load:</span>
          <span className="text-slate-gray">{metrics.pageLoadTime.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>DOM Ready:</span>
          <span className="text-slate-gray">{metrics.domContentLoaded.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className="text-slate-gray">{metrics.firstContentfulPaint.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className="text-slate-gray">{metrics.largestContentfulPaint.toFixed(0)}ms</span>
        </div>
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className="text-slate-gray">{metrics.cumulativeLayoutShift.toFixed(3)}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-dim-gray border-t border-slate-gray/30 pt-2">
        Press F12 for detailed metrics
      </div>
    </div>
  )
}
