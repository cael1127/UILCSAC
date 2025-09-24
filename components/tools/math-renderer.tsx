"use client"

import React from 'react'
import { MathJax, MathJaxContext } from 'better-react-mathjax'

interface MathRendererProps {
  children: string
  inline?: boolean
  className?: string
}

// MathJax configuration optimized for UIL Math and Science
const mathJaxConfig = {
  loader: { load: ['[tex]/html'] },
  tex: {
    packages: { '[+]': ['html'] },
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)']
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]']
    ],
    processEscapes: true,
    processEnvironments: true,
    tags: 'ams',
    macros: {
      // Common UIL Math macros
      RR: '\\mathbb{R}',
      ZZ: '\\mathbb{Z}',
      NN: '\\mathbb{N}',
      QQ: '\\mathbb{Q}',
      CC: '\\mathbb{C}',
      // Chemistry macros
      ce: ['\\require{mhchem}\\ce{#1}', 1],
      // Physics macros
      vec: ['\\overrightarrow{#1}', 1],
      unit: ['\\,\\text{#1}', 1]
    }
  },
  options: {
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process'
  }
}

export function MathJaxProvider({ children }: { children: React.ReactNode }) {
  return (
    <MathJaxContext config={mathJaxConfig}>
      {children}
    </MathJaxContext>
  )
}

export default function MathRenderer({ children, inline = false, className = '' }: MathRendererProps) {
  // Clean up the math expression
  const cleanMath = children.trim()
  
  // Determine if this should be inline or display math
  const isDisplayMath = !inline && (
    cleanMath.startsWith('$$') || 
    cleanMath.startsWith('\\[') ||
    cleanMath.includes('\\begin{') ||
    cleanMath.includes('\\frac') ||
    cleanMath.includes('\\sum') ||
    cleanMath.includes('\\int')
  )

  return (
    <div className={`math-renderer ${className} ${isDisplayMath ? 'display-math' : 'inline-math'}`}>
      <MathJax 
        inline={!isDisplayMath}
        dynamic={true}
      >
        {cleanMath}
      </MathJax>
    </div>
  )
}

// Utility function to detect if text contains math
export function containsMath(text: string): boolean {
  const mathPatterns = [
    /\$.*?\$/,           // $...$
    /\\\(.*?\\\)/,       // \(...\)
    /\$\$.*?\$\$/,       // $$...$$
    /\\\[.*?\\\]/,       // \[...\]
    /\\begin\{.*?\}/,    // \begin{...}
    /\\frac\{.*?\}/,     // \frac{...}
    /\\sqrt\{.*?\}/,     // \sqrt{...}
    /\^[0-9{]/,          // superscripts
    /_[0-9{]/,           // subscripts
    /\\[a-zA-Z]+/        // LaTeX commands
  ]
  
  return mathPatterns.some(pattern => pattern.test(text))
}

// Component for rendering mixed text and math content
export function MixedContentRenderer({ content, className = '' }: { content: string, className?: string }) {
  if (!containsMath(content)) {
    return <span className={className}>{content}</span>
  }

  // Split content by math delimiters while preserving them
  const parts = content.split(/(\$\$.*?\$\$|\$.*?\$|\\[\[\(].*?\\[\]\)])/g)
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (containsMath(part)) {
          return (
            <MathRenderer key={index} inline={!part.startsWith('$$')}>
              {part}
            </MathRenderer>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

// Specialized components for different subjects
export function ChemistryRenderer({ formula, className = '' }: { formula: string, className?: string }) {
  return (
    <MathRenderer className={`chemistry-formula ${className}`}>
      {`\\ce{${formula}}`}
    </MathRenderer>
  )
}

export function PhysicsEquation({ equation, className = '' }: { equation: string, className?: string }) {
  return (
    <MathRenderer className={`physics-equation ${className}`}>
      {equation}
    </MathRenderer>
  )
}

export function MathProblem({ problem, className = '' }: { problem: string, className?: string }) {
  return (
    <div className={`math-problem ${className}`}>
      <MixedContentRenderer content={problem} />
    </div>
  )
}
