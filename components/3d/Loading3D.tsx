"use client"

import { motion } from 'framer-motion'
import { LoadingSpinner3D } from './ProgressRing3D'
import SimpleLoading3D from './SimpleLoading3D'

interface Loading3DProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Loading3D({ 
  message = "Loading...", 
  size = 'md',
  className = ''
}: Loading3DProps) {
  // Use simple loading for auth checks and other critical areas
  // Use 3D loading for demo and showcase areas
  const useSimpleLoading = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/auth/') || 
     window.location.pathname.includes('/dashboard'))

  if (useSimpleLoading) {
    return <SimpleLoading3D message={message} size={size} className={className} />
  }

  const sizeMap = {
    sm: 40,
    md: 60,
    lg: 80
  }

  return (
    <motion.div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <LoadingSpinner3D 
        size={sizeMap[size]} 
        color="var(--primary)"
        speed={1.5}
      />
      <motion.p
        className="text-[var(--muted-foreground)] text-sm font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </motion.div>
  )
}

// 3D Page Transition Component
interface PageTransition3DProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition3D({ children, className = '' }: PageTransition3DProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      exit={{ opacity: 0, y: -20, rotateX: 15 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

// 3D Button Loading State
interface ButtonLoading3DProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}

export function ButtonLoading3D({ isLoading, children, className = '' }: ButtonLoading3DProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: isLoading ? 1 : 1.05 }}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
    >
      {children}
      
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm rounded-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <SimpleLoading3D 
            message=""
            size="sm"
            className="scale-75"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

// 3D Skeleton Loading
interface Skeleton3DProps {
  className?: string
  height?: string
  width?: string
  animated?: boolean
}

export function Skeleton3D({ 
  className = '', 
  height = '1rem', 
  width = '100%',
  animated = true
}: Skeleton3DProps) {
  return (
    <motion.div
      className={`bg-[var(--muted)] rounded-md ${className}`}
      style={{ height, width }}
      animate={animated ? {
        opacity: [0.5, 1, 0.5],
        scale: [0.98, 1, 0.98]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// 3D Card Skeleton
export function CardSkeleton3D({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 space-y-4 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-3">
        <Skeleton3D height="2rem" width="2rem" className="rounded-lg" />
        <Skeleton3D height="1.5rem" width="60%" />
      </div>
      <Skeleton3D height="1rem" width="100%" />
      <Skeleton3D height="1rem" width="80%" />
      <div className="flex space-x-2">
        <Skeleton3D height="2rem" width="6rem" className="rounded-md" />
        <Skeleton3D height="2rem" width="4rem" className="rounded-md" />
      </div>
    </motion.div>
  )
}
