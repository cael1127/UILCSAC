"use client"

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Button3DProps extends React.ComponentProps<typeof Button> {
  hoverScale?: number
  glowColor?: string
  animated?: boolean
  children: React.ReactNode
}

function Button3D({
  className,
  hoverScale = 1.05,
  glowColor = 'var(--primary)',
  animated = true,
  children,
  ...props
}: Button3DProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        scale: hoverScale,
        y: -2
      }}
      whileTap={{ 
        scale: 0.95,
        y: 0
      }}
      animate={animated ? {
        boxShadow: isHovered 
          ? `0 10px 30px ${glowColor}40, 0 0 20px ${glowColor}20`
          : `0 4px 15px ${glowColor}20`
      } : {}}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className="relative"
    >
      <Button
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/25",
          className
        )}
        style={{
          transformStyle: 'preserve-3d',
          '--glow-color': glowColor
        } as React.CSSProperties}
        {...props}
      >
        {/* 3D Effect Overlay */}
        <motion.div
          className="absolute inset-0 rounded-md"
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${glowColor}10 50%, transparent 100%)`,
            opacity: isHovered ? 1 : 0
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={isHovered ? { y: -1 } : { y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </Button>
    </motion.div>
  )
}

// 3D Icon Button
interface IconButton3DProps extends Omit<Button3DProps, 'children'> {
  icon: React.ComponentType<{ className?: string; size?: number }>
  label?: string
  iconSize?: number
}

export function IconButton3D({
  icon: Icon,
  label,
  iconSize = 16,
  className,
  ...props
}: IconButton3DProps) {
  return (
    <Button3D className={cn("flex items-center space-x-2", className)} {...props}>
      <Icon size={iconSize} />
      {label && <span>{label}</span>}
    </Button3D>
  )
}

// 3D Floating Action Button
interface FloatingActionButton3DProps extends Omit<Button3DProps, 'children'> {
  icon: React.ComponentType<{ className?: string; size?: number }>
  tooltip?: string
}

export function FloatingActionButton3D({
  icon: Icon,
  tooltip,
  className,
  ...props
}: FloatingActionButton3DProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        y: [0, -5, 0],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <Button3D
        size="lg"
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl",
          className
        )}
        {...props}
      >
        <Icon size={24} />
      </Button3D>
      
      {tooltip && (
        <motion.div
          className="absolute right-16 top-1/2 -translate-y-1/2 bg-foreground text-background px-3 py-1 rounded-md text-sm whitespace-nowrap"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tooltip}
        </motion.div>
      )}
    </motion.div>
  )
}

export { Button3D }
export default Button3D
