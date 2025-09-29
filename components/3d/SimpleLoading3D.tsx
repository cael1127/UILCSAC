"use client"

import { motion } from 'framer-motion'

interface SimpleLoading3DProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function SimpleLoading3D({ 
  message = "Loading...", 
  size = 'md',
  className = ''
}: SimpleLoading3DProps) {
  const sizeMap = {
    sm: 24,
    md: 40,
    lg: 60
  }

  const spinnerSize = sizeMap[size]

  return (
    <motion.div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* CSS-based 3D-looking spinner */}
      <div className="relative" style={{ width: spinnerSize, height: spinnerSize }}>
        <motion.div
          className="absolute inset-0 border-4 border-[var(--primary)]/20 rounded-full"
          style={{ width: spinnerSize, height: spinnerSize }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-transparent border-t-[var(--primary)] rounded-full"
          style={{ width: spinnerSize, height: spinnerSize }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-transparent border-b-[var(--primary)]/60 rounded-full"
          style={{ width: spinnerSize - 16, height: spinnerSize - 16 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 bg-[var(--primary)] rounded-full"
          style={{ width: spinnerSize - 32, height: spinnerSize - 32 }}
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
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

// Alternative simple spinner for auth checks
export function AuthLoadingSpinner({ message = "Checking authentication..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <SimpleLoading3D message={message} size="md" />
    </div>
  )
}
