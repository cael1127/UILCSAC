"use client"

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Mesh } from 'three'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface Icon3DProps {
  icon: LucideIcon
  color?: string
  size?: number
  className?: string
  animated?: boolean
  hoverEffect?: boolean
}

// Internal component that uses Three.js hooks
function Icon3DInternal({ 
  icon: Icon, 
  color = 'var(--primary)', 
  size = 32, 
  animated = true,
  hoverEffect = true
}: Omit<Icon3DProps, 'className'>) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame(() => {
    if (meshRef.current && animated) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.x += 0.005
    }
  })

  const normalizedSize = size / 32 // Normalize for Three.js

  return (
    <mesh
      ref={meshRef}
      scale={hovered && hoverEffect ? normalizedSize * 1.2 : normalizedSize}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.5} 
        metalness={0.8}
        transparent
        opacity={hovered ? 0.9 : 0.7}
      />
    </mesh>
  )
}

// Main component with Canvas wrapper
export function Icon3D({ 
  icon, 
  color = 'var(--primary)', 
  size = 32, 
  className = '',
  animated = true,
  hoverEffect = true
}: Icon3DProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Fallback for SSR
    const Icon = icon
    return <Icon className={className} size={size} style={{ color }} />
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} />
        
        <Icon3DInternal
          icon={icon}
          color={color}
          size={size}
          animated={animated}
          hoverEffect={hoverEffect}
        />
        
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}

// Simple 3D Icon (CSS-based fallback)
export function SimpleIcon3D({ 
  icon: Icon, 
  color = 'var(--primary)', 
  size = 32, 
  className = '',
  animated = true
}: Omit<Icon3DProps, 'hoverEffect'>) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.1, rotateY: 180 }}
      animate={animated ? { 
        rotateY: [0, 360],
        scale: [1, 1.05, 1]
      } : {}}
      transition={animated ? { 
        duration: 4, 
        repeat: Infinity, 
        ease: "easeInOut" 
      } : { duration: 0.3 }}
    >
      <div
        className="w-full h-full flex items-center justify-center rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}10)`,
          boxShadow: `0 0 20px ${color}40`
        }}
      >
        <Icon 
          size={size * 0.6} 
          style={{ color }} 
        />
      </div>
    </motion.div>
  )
}
