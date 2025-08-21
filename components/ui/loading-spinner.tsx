import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-slate-gray/20 border-t-ut-orange ${sizeClasses[size]} ${className}`} />
  )
}

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-gray/20 ${className}`}>
      {children}
    </div>
  )
}

interface ContentLoaderProps {
  lines?: number
  className?: string
}

export function ContentLoader({ lines = 3, className = '' }: ContentLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

interface PageLoaderProps {
  text?: string
  className?: string
}

export function PageLoader({ text = 'Loading...', className = '' }: PageLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      <LoadingSpinner size="xl" className="mb-4" />
      <p className="text-dim-gray font-medium">{text}</p>
    </div>
  )
}

// Specialized loaders for different content types
export function CardLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 rounded-lg border border-slate-gray/20 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <ContentLoader lines={2} />
    </div>
  )
}

export function TableLoader({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4 pb-2 border-b border-slate-gray/20">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 py-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

export function CodeEditorLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`border border-slate-gray/20 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="bg-slate-gray/10 px-4 py-2 border-b border-slate-gray/20">
        <div className="flex space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
      </div>
      {/* Code area */}
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
