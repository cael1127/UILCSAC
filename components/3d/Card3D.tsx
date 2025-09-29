"use client"

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Box, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface Card3DProps {
  children: React.ReactNode
  className?: string
  hoverScale?: number
  rotationIntensity?: number
  glowColor?: string
  depth?: number
  onClick?: () => void
}

export default function Card3D({ 
  children, 
  className = '', 
  hoverScale = 1.05,
  rotationIntensity = 0.1,
  glowColor = 'var(--primary)',
  depth = 0.1,
  onClick
}: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* 3D Card Container */}
      <div
        className="relative w-full h-full transition-all duration-500 ease-out"
        style={{
          transform: isHovered 
            ? `rotateY(${mousePosition.x * rotationIntensity * 10}deg) rotateX(${-mousePosition.y * rotationIntensity * 10}deg) translateZ(${depth * 20}px)`
            : 'rotateY(0deg) rotateX(0deg) translateZ(0px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Glow Effect */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-xl opacity-20 blur-xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at center, ${glowColor} 0%, transparent 70%)`,
              transform: 'translateZ(-1px)'
            }}
          />
        )}
        
        {/* Main Card Content */}
        <div
          className="relative w-full h-full rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg transition-all duration-500"
          style={{
            transform: 'translateZ(0px)',
            boxShadow: isHovered 
              ? `0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px ${glowColor}20`
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          {children}
        </div>

        {/* 3D Depth Shadow */}
        <div
          className="absolute inset-0 rounded-xl bg-[var(--foreground)] opacity-5 transition-all duration-500"
          style={{
            transform: `translateZ(-${depth * 10}px) translateY(${depth * 5}px)`,
            filter: 'blur(2px)'
          }}
        />
      </div>

      {/* Floating Particles on Hover */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[var(--primary)] rounded-full"
              initial={{ 
                x: '50%', 
                y: '50%', 
                opacity: 0,
                scale: 0
              }}
              animate={{
                x: `${50 + (Math.random() - 0.5) * 200}%`,
                y: `${50 + (Math.random() - 0.5) * 200}%`,
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

// 3D Icon Component for subject cards
interface Icon3DProps {
  icon: React.ComponentType<{ className?: string }>
  className?: string
  color?: string
  size?: number
}

export function Icon3D({ icon: Icon, className = '', color = 'var(--primary)', size = 48 }: Icon3DProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        scale: 1.1,
        rotateY: 180,
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Front Face */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: 'translateZ(0px)',
          backfaceVisibility: 'hidden'
        }}
      >
        <Icon className={`text-[${color}]`} />
      </div>
      
      {/* Back Face */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: 'translateZ(-1px) rotateY(180deg)',
          backfaceVisibility: 'hidden'
        }}
      >
        <Icon className={`text-[${color}] opacity-60`} />
      </div>

      {/* Glow Effect */}
      {isHovered && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-30"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            transform: 'translateZ(-2px) scale(1.5)'
          }}
        />
      )}
    </motion.div>
  )
}
