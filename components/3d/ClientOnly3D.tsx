"use client"

import { useState, useEffect, ReactNode } from 'react'

interface ClientOnly3DProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ClientOnly3D({ children, fallback }: ClientOnly3DProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return fallback || (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)] mx-auto mb-2"></div>
          <p className="text-sm text-[var(--muted-foreground)]">Loading 3D content...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
