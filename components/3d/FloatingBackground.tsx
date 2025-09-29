"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, Box, Torus, Octahedron } from '@react-three/drei'
import * as THREE from 'three'

interface FloatingShapeProps {
  position: [number, number, number]
  color: string
  speed: number
  shape: 'sphere' | 'box' | 'torus' | 'octahedron'
}

function FloatingShape({ position, color, speed, shape }: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.01
      meshRef.current.rotation.y += speed * 0.005
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.002
    }
  })

  const geometry = useMemo(() => {
    switch (shape) {
      case 'sphere':
        return <Sphere args={[0.5, 32, 32]} />
      case 'box':
        return <Box args={[0.8, 0.8, 0.8]} />
      case 'torus':
        return <Torus args={[0.4, 0.2, 16, 32]} />
      case 'octahedron':
        return <Octahedron args={[0.6]} />
      default:
        return <Sphere args={[0.5, 32, 32]} />
    }
  }, [shape])

  return (
    <mesh ref={meshRef} position={position}>
      {geometry}
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={0.6}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}

interface FloatingBackgroundProps {
  theme?: string
  intensity?: number
}

export default function FloatingBackground({ theme = 'ut-orange', intensity = 8 }: FloatingBackgroundProps) {
  const shapes = useMemo(() => {
    const colors = {
      'ut-orange': ['#fb8b24', '#0a0903', '#7c90a0'],
      'maroon': ['#7a2121', '#323334', '#eaeaeb'],
      'warm-sunset': ['#ff785a', '#fff05a', '#191919'],
      'ocean-vibes': ['#00916e', '#65def1', '#0a0903'],
      'bondi-blue': ['#0087ac', '#f4f9e9', '#7c90a0']
    }
    
    const themeColors = colors[theme as keyof typeof colors] || colors['ut-orange']
    const shapeTypes: Array<'sphere' | 'box' | 'torus' | 'octahedron'> = ['sphere', 'box', 'torus', 'octahedron']
    
    return Array.from({ length: intensity }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 20
      ] as [number, number, number],
      color: themeColors[Math.floor(Math.random() * themeColors.length)],
      speed: Math.random() * 0.5 + 0.1,
      shape: shapeTypes[Math.floor(Math.random() * shapeTypes.length)]
    }))
  }, [theme, intensity])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        
        {shapes.map((shape, index) => (
          <FloatingShape
            key={index}
            position={shape.position}
            color={shape.color}
            speed={shape.speed}
            shape={shape.shape}
          />
        ))}
      </Canvas>
    </div>
  )
}
