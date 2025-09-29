"use client"

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Input3DProps extends React.ComponentProps<typeof Input> {
  focusScale?: number
  glowColor?: string
  animated?: boolean
  floatingLabel?: string
}

export default function Input3D({
  className,
  focusScale = 1.02,
  glowColor = 'var(--primary)',
  animated = true,
  floatingLabel,
  ...props
}: Input3DProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  return (
    <motion.div
      className="relative"
      animate={isFocused ? {
        scale: focusScale,
        boxShadow: `0 0 20px ${glowColor}30`
      } : {
        scale: 1,
        boxShadow: `0 0 5px ${glowColor}10`
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Input
        className={cn(
          "relative transition-all duration-300",
          "focus:ring-2 focus:ring-primary/20",
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
        {...props}
      />
      
      {/* Floating Label */}
      {floatingLabel && (
        <motion.label
          className={cn(
            "absolute left-3 transition-all duration-300 pointer-events-none",
            isFocused || hasValue 
              ? "text-xs -top-2 bg-background px-1 text-primary" 
              : "text-sm top-1/2 -translate-y-1/2 text-muted-foreground"
          )}
          animate={{
            y: isFocused || hasValue ? -8 : 0,
            scale: isFocused || hasValue ? 0.85 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {floatingLabel}
        </motion.label>
      )}
      
      {/* 3D Effect Overlay */}
      <motion.div
        className="absolute inset-0 rounded-md pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${glowColor}05 50%, transparent 100%)`,
          opacity: isFocused ? 1 : 0
        }}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

// 3D Textarea
interface Textarea3DProps extends React.ComponentProps<'textarea'> {
  focusScale?: number
  glowColor?: string
  animated?: boolean
  floatingLabel?: string
}

export function Textarea3D({
  className,
  focusScale = 1.02,
  glowColor = 'var(--primary)',
  animated = true,
  floatingLabel,
  ...props
}: Textarea3DProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  return (
    <motion.div
      className="relative"
      animate={isFocused ? {
        scale: focusScale,
        boxShadow: `0 0 20px ${glowColor}30`
      } : {
        scale: 1,
        boxShadow: `0 0 5px ${glowColor}10`
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300",
          className
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setHasValue(e.target.value.length > 0)}
        {...props}
      />
      
      {/* Floating Label */}
      {floatingLabel && (
        <motion.label
          className={cn(
            "absolute left-3 transition-all duration-300 pointer-events-none",
            isFocused || hasValue 
              ? "text-xs -top-2 bg-background px-1 text-primary" 
              : "text-sm top-3 text-muted-foreground"
          )}
          animate={{
            y: isFocused || hasValue ? -8 : 0,
            scale: isFocused || hasValue ? 0.85 : 1
          }}
          transition={{ duration: 0.2 }}
        >
          {floatingLabel}
        </motion.label>
      )}
      
      {/* 3D Effect Overlay */}
      <motion.div
        className="absolute inset-0 rounded-md pointer-events-none"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${glowColor}05 50%, transparent 100%)`,
          opacity: isFocused ? 1 : 0
        }}
        animate={{ opacity: isFocused ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
