"use client"

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Ring, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'

interface ProgressRing3DProps {
  progress: number
  size?: number
  thickness?: number
  color?: string
  backgroundColor?: string
  animated?: boolean
  className?: string
  showText?: boolean
  textColor?: string
}

// Internal component that uses Three.js hooks
function ProgressRingInternal({ 
  progress, 
  size = 100, 
  thickness = 8, 
  color = '#fb8b24',
  backgroundColor = '#e5e7eb',
  animated = true,
  showText = true,
  textColor = '#000000'
}: Omit<ProgressRing3DProps, 'className'>) {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (animated && groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const radius = size / 100 // Better size conversion for Three.js units
  const progressAngle = (progress / 100) * Math.PI * 2
  const normalizedThickness = thickness / 100

  // Convert CSS variables to actual colors
  const getColorValue = (colorStr: string) => {
    if (colorStr.startsWith('var(--')) {
      // For CSS variables, we'll use a fallback color
      if (colorStr.includes('primary')) return '#fb8b24'
      if (colorStr.includes('muted')) return '#e5e7eb'
      if (colorStr.includes('foreground')) return '#000000'
      return '#fb8b24' // Default fallback
    }
    return colorStr
  }

  const resolvedColor = getColorValue(color)
  const resolvedBackgroundColor = getColorValue(backgroundColor)
  const resolvedTextColor = getColorValue(textColor)

  return (
    <group ref={groupRef}>
      {/* Background Ring */}
      <Ring
        args={[radius, radius + normalizedThickness, 64]}
        rotation={[0, 0, 0]}
      >
        <meshBasicMaterial 
          color={resolvedBackgroundColor} 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {/* Progress Ring - Only show if progress > 0 */}
      {progress > 0 && (
        <Ring
          args={[radius, radius + normalizedThickness, 64, 1, 0, progressAngle]}
          rotation={[0, 0, -Math.PI / 2]}
        >
          <meshBasicMaterial 
            color={resolvedColor} 
            transparent 
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
      
      {/* Progress Text */}
      {showText && (
        <Text
          position={[0, 0, normalizedThickness + 0.01]}
          fontSize={radius * 0.25}
          color={resolvedTextColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={radius * 0.8}
        >
          {Math.round(progress)}%
        </Text>
      )}
    </group>
  )
}

// Main component with Canvas wrapper
export default function ProgressRing3D({
  progress,
  size = 100,
  thickness = 8,
  color = 'var(--primary)',
  backgroundColor = 'var(--muted)',
  animated = true,
  className = '',
  showText = true,
  textColor = 'var(--foreground)'
}: ProgressRing3DProps) {
  const [mounted, setMounted] = useState(false)
  const [resolvedColors, setResolvedColors] = useState({
    color: '#fb8b24',
    backgroundColor: '#e5e7eb',
    textColor: '#000000'
  })

  useEffect(() => {
    setMounted(true)
    
    // Resolve CSS variables to actual colors
    const resolveColor = (colorStr: string) => {
      if (colorStr.startsWith('var(--')) {
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          const resolved = getComputedStyle(root).getPropertyValue(colorStr.substring(4, colorStr.length - 1)).trim()
          return resolved || '#fb8b24'
        }
        // Fallback colors for SSR
        if (colorStr.includes('primary')) return '#fb8b24'
        if (colorStr.includes('muted')) return '#e5e7eb'
        if (colorStr.includes('foreground')) return '#000000'
        return '#fb8b24'
      }
      return colorStr
    }

    setResolvedColors({
      color: resolveColor(color),
      backgroundColor: resolveColor(backgroundColor),
      textColor: resolveColor(textColor)
    })
  }, [color, backgroundColor, textColor])

  if (!mounted) {
    // Fallback for SSR
    return (
      <div 
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div
          className="relative rounded-full border-4"
          style={{
            width: size,
            height: size,
            borderColor: resolvedColors.backgroundColor,
            borderTopColor: resolvedColors.color,
            transform: 'rotate(45deg)',
          }}
        />
        {showText && (
          <div 
            className="absolute inset-0 flex items-center justify-center text-sm font-bold"
            style={{ color: resolvedColors.textColor }}
          >
            {Math.round(progress)}%
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} className="w-full h-full">
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} />
        
        <ProgressRingInternal
          progress={progress}
          size={size}
          thickness={thickness}
          color={resolvedColors.color}
          backgroundColor={resolvedColors.backgroundColor}
          animated={animated}
          showText={showText}
          textColor={resolvedColors.textColor}
        />
      </Canvas>
    </div>
  )
}

// 3D Animated Progress Bar
interface ProgressBar3DProps {
  progress: number
  width?: number
  height?: number
  color?: string
  backgroundColor?: string
  animated?: boolean
  className?: string
}

function ProgressBarInternal({
  progress,
  width = 200,
  height = 20,
  color = '#fb8b24',
  backgroundColor = '#e5e7eb',
  animated = true
}: Omit<ProgressBar3DProps, 'className'>) {
  const barRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (animated && barRef.current) {
      barRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  const normalizedWidth = width / 100
  const normalizedHeight = height / 100
  const progressWidth = (progress / 100) * normalizedWidth

  return (
    <group>
      {/* Background Bar */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[normalizedWidth, normalizedHeight, 0.1]} />
        <meshBasicMaterial 
          color={backgroundColor} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Progress Bar */}
      {progress > 0 && (
        <mesh ref={barRef} position={[-(normalizedWidth - progressWidth) / 2, 0, 0.05]}>
          <boxGeometry args={[progressWidth, normalizedHeight * 0.8, 0.1]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.8}
          />
        </mesh>
      )}
    </group>
  )
}

export function ProgressBar3D({
  progress,
  width = 200,
  height = 20,
  color = 'var(--primary)',
  backgroundColor = 'var(--muted)',
  animated = true,
  className = ''
}: ProgressBar3DProps) {
  const [mounted, setMounted] = useState(false)
  const [resolvedColors, setResolvedColors] = useState({
    color: '#fb8b24',
    backgroundColor: '#e5e7eb'
  })

  useEffect(() => {
    setMounted(true)
    
    // Resolve CSS variables to actual colors
    const resolveColor = (colorStr: string) => {
      if (colorStr.startsWith('var(--')) {
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          const resolved = getComputedStyle(root).getPropertyValue(colorStr.substring(4, colorStr.length - 1)).trim()
          return resolved || '#fb8b24'
        }
        // Fallback colors for SSR
        if (colorStr.includes('primary')) return '#fb8b24'
        if (colorStr.includes('muted')) return '#e5e7eb'
        return '#fb8b24'
      }
      return colorStr
    }

    setResolvedColors({
      color: resolveColor(color),
      backgroundColor: resolveColor(backgroundColor)
    })
  }, [color, backgroundColor])

  if (!mounted) {
    return (
      <div 
        className={`relative ${className}`}
        style={{ width, height }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ backgroundColor: resolvedColors.backgroundColor }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: resolvedColors.color 
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} className="w-full h-full">
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <ProgressBarInternal
          progress={progress}
          width={width}
          height={height}
          color={resolvedColors.color}
          backgroundColor={resolvedColors.backgroundColor}
          animated={animated}
        />
      </Canvas>
    </div>
  )
}

// 3D Loading Spinner Component
interface LoadingSpinner3DProps {
  size?: number
  color?: string
  speed?: number
  className?: string
}

// Internal component that uses Three.js hooks
function LoadingSpinner3DInternal({ 
  size = 60, 
  color = 'var(--primary)', 
  speed = 1
}: Omit<LoadingSpinner3DProps, 'className'>) {
  const groupRef = useRef<THREE.Group>(null!)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * speed
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Outer Ring */}
      <Ring args={[size * 0.3, size * 0.35, 32]}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {/* Inner Ring */}
      <Ring args={[size * 0.2, size * 0.25, 32]}>
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {/* Center Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size * 0.1, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

// Wrapper component that includes the Canvas
export function LoadingSpinner3D({ 
  size = 60, 
  color = 'var(--primary)', 
  speed = 1,
  className = ''
}: LoadingSpinner3DProps) {
  const [mounted, setMounted] = useState(false)
  const [resolvedColor, setResolvedColor] = useState('#fb8b24')

  useEffect(() => {
    setMounted(true)
    
    // Resolve CSS variables to actual colors
    const resolveColor = (colorStr: string) => {
      if (colorStr.startsWith('var(--')) {
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          const resolved = getComputedStyle(root).getPropertyValue(colorStr.substring(4, colorStr.length - 1)).trim()
          return resolved || '#fb8b24'
        }
        // Fallback colors for SSR
        if (colorStr.includes('primary')) return '#fb8b24'
        return '#fb8b24'
      }
      return colorStr
    }

    setResolvedColor(resolveColor(color))
  }, [color])

  if (!mounted) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full border-4 border-t-transparent" 
             style={{ 
               width: size, 
               height: size,
               borderColor: resolvedColor,
               borderTopColor: 'transparent'
             }} />
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="w-full h-full">
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} />
        
        <LoadingSpinner3DInternal 
          size={size}
          color={resolvedColor}
          speed={speed}
        />
      </Canvas>
    </div>
  )
}