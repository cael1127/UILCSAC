"use client"

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Badge3DProps extends React.ComponentProps<typeof Badge> {
  hoverScale?: number
  glowColor?: string
  animated?: boolean
  pulse?: boolean
}

function Badge3D({
  className,
  hoverScale = 1.1,
  glowColor = 'var(--primary)',
  animated = true,
  pulse = false,
  children,
  ...props
}: Badge3DProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: hoverScale,
        y: -2
      }}
      whileTap={{ scale: 0.95 }}
      animate={animated ? {
        boxShadow: pulse 
          ? `0 0 15px ${glowColor}40, 0 0 30px ${glowColor}20`
          : `0 2px 8px ${glowColor}20`
      } : {}}
      transition={{ 
        duration: 0.3,
        ease: "easeOut"
      }}
      className="relative inline-block"
    >
      <Badge
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
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${glowColor}20 50%, transparent 100%)`,
            opacity: 0
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        
        {/* Content */}
        <motion.span
          className="relative z-10"
          animate={pulse ? {
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          } : {}}
          transition={{
            duration: 2,
            repeat: pulse ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {children}
        </motion.span>
      </Badge>
    </motion.div>
  )
}

// 3D Status Badge
interface StatusBadge3DProps extends Omit<Badge3DProps, 'children'> {
  status: 'success' | 'warning' | 'error' | 'info' | 'default'
  children: React.ReactNode
}

function StatusBadge3D({
  status,
  className,
  ...props
}: StatusBadge3DProps) {
  const statusConfig = {
    success: {
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      glowColor: "rgb(34, 197, 94)"
    },
    warning: {
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      glowColor: "rgb(234, 179, 8)"
    },
    error: {
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      glowColor: "rgb(239, 68, 68)"
    },
    info: {
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      glowColor: "rgb(59, 130, 246)"
    },
    default: {
      className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      glowColor: "rgb(107, 114, 128)"
    }
  }

  const config = statusConfig[status]

  return (
    <Badge3D
      className={cn(config.className, className)}
      glowColor={config.glowColor}
      {...props}
    >
      {props.children}
    </Badge3D>
  )
}

// 3D Notification Badge
interface NotificationBadge3DProps extends Omit<Badge3DProps, 'children'> {
  count: number
  max?: number
  showZero?: boolean
}

function NotificationBadge3D({
  count,
  max = 99,
  showZero = false,
  className,
  ...props
}: NotificationBadge3DProps) {
  const displayCount = count > max ? `${max}+` : count.toString()
  
  if (count === 0 && !showZero) return null

  return (
    <Badge3D
      className={cn(
        "absolute -top-2 -right-2 min-w-[20px] h-5 px-1 text-xs font-bold",
        "bg-red-500 text-white border-red-500",
        className
      )}
      glowColor="rgb(239, 68, 68)"
      pulse={count > 0}
      {...props}
    >
      {displayCount}
    </Badge3D>
  )
}

export { Badge3D, StatusBadge3D, NotificationBadge3D }
export default Badge3D
