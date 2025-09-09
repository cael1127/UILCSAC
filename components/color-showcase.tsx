"use client"

import { useState } from 'react'

export function ColorShowcase() {
  const [isVisible, setIsVisible] = useState(false)

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') return null

  const colors = [
    { name: 'UT Orange', class: 'bg-ut-orange', hex: '#fb8b24' },
    { name: 'Smoky Black', class: 'bg-smoky-black', hex: '#0a0903' },
    { name: 'Slate Gray', class: 'bg-slate-gray', hex: '#7c90a0' },
    { name: 'Dim Gray', class: 'bg-dim-gray', hex: '#747274' },
    { name: 'Ivory', class: 'bg-ivory', hex: '#f4f9e9' },
  ]

  const gradients = [
    { name: 'UT Gradient', class: 'gradient-ut', description: 'Orange to Black' },
    { name: 'Cool Gradient', class: 'gradient-cool', description: 'Slate to Dim Gray' },
    { name: 'Warm Gradient', class: 'gradient-warm', description: 'Orange to Ivory' },
  ]

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-[var(--primary)]/90 transition-colors"
      >
        {isVisible ? '🎨 Hide' : '🎨 Colors'}
      </button>

      {isVisible && (
        <div className="mt-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl p-4 max-w-xs">
          <h3 className="font-bold text-[var(--foreground)] mb-3 text-sm">UT Color Scheme</h3>
          
          {/* Solid Colors */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Solid Colors</p>
            {colors.map((color) => (
              <div key={color.name} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${color.class} border border-[var(--border)]`} />
                <span className="text-xs text-[var(--foreground)]">{color.name}</span>
                <span className="text-xs text-[var(--muted-foreground)] ml-auto">{color.hex}</span>
              </div>
            ))}
          </div>

          {/* Gradients */}
          <div className="space-y-2 mb-4">
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Gradients</p>
            {gradients.map((gradient) => (
              <div key={gradient.name} className="space-y-1">
                <div className={`h-8 rounded ${gradient.class}`} />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--foreground)]">{gradient.name}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{gradient.description}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Utility Classes */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Utility Classes</p>
            <div className="text-xs text-[var(--foreground)] space-y-1">
                             <p>• <code className="bg-[var(--muted)] px-1 rounded">bg-ut-orange</code></p>
               <p>• <code className="bg-[var(--muted)] px-1 rounded">text-smoky-black</code></p>
               <p>• <code className="bg-[var(--muted)] px-1 rounded">border-[var(--border)]</code></p>
               <p>• <code className="bg-[var(--muted)] px-1 rounded">gradient-ut</code></p>
               <p>• <code className="bg-[var(--muted)] px-1 rounded">hover-lift</code></p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
