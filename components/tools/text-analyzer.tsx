"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Highlighter, 
  MessageSquare, 
  Search,
  Eye,
  PenTool,
  Quote,
  Lightbulb
} from 'lucide-react'

interface TextAnalyzerProps {
  passage: string
  title?: string
  author?: string
  genre?: string
  period?: string
  showAnalysisTools?: boolean
  className?: string
}

interface Annotation {
  id: string
  start: number
  end: number
  text: string
  type: 'theme' | 'symbol' | 'device' | 'character' | 'setting' | 'tone'
  note: string
  color: string
}

const ANNOTATION_TYPES = {
  theme: { label: 'Theme', color: 'bg-blue-200 text-blue-800', icon: Lightbulb },
  symbol: { label: 'Symbol', color: 'bg-purple-200 text-purple-800', icon: Eye },
  device: { label: 'Literary Device', color: 'bg-green-200 text-green-800', icon: PenTool },
  character: { label: 'Character', color: 'bg-orange-200 text-orange-800', icon: MessageSquare },
  setting: { label: 'Setting', color: 'bg-yellow-200 text-yellow-800', icon: Search },
  tone: { label: 'Tone/Mood', color: 'bg-pink-200 text-pink-800', icon: Quote }
}

export default function TextAnalyzer({
  passage,
  title,
  author,
  genre,
  period,
  showAnalysisTools = true,
  className = ''
}: TextAnalyzerProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null)
  const [activeAnnotationType, setActiveAnnotationType] = useState<keyof typeof ANNOTATION_TYPES>('theme')
  const [annotationNote, setAnnotationNote] = useState('')
  const [showAnnotations, setShowAnnotations] = useState(true)
  const passageRef = useRef<HTMLDivElement>(null)

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = selection.toString().trim()
    
    if (selectedText.length === 0) return

    // Calculate position relative to the passage
    const passageElement = passageRef.current
    if (!passageElement) return

    const passageText = passageElement.textContent || ''
    const start = passageText.indexOf(selectedText)
    const end = start + selectedText.length

    if (start !== -1) {
      setSelectedText(selectedText)
      setSelectionRange({ start, end })
    }
  }

  // Add annotation
  const addAnnotation = () => {
    if (!selectedText || !selectionRange || !annotationNote.trim()) return

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      start: selectionRange.start,
      end: selectionRange.end,
      text: selectedText,
      type: activeAnnotationType,
      note: annotationNote.trim(),
      color: ANNOTATION_TYPES[activeAnnotationType].color
    }

    setAnnotations(prev => [...prev, newAnnotation])
    setSelectedText('')
    setSelectionRange(null)
    setAnnotationNote('')
    
    // Clear selection
    window.getSelection()?.removeAllRanges()
  }

  // Remove annotation
  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
  }

  // Render passage with annotations
  const renderAnnotatedPassage = () => {
    if (!showAnnotations || annotations.length === 0) {
      return <div className="whitespace-pre-wrap leading-relaxed">{passage}</div>
    }

    // Sort annotations by start position
    const sortedAnnotations = [...annotations].sort((a, b) => a.start - b.start)
    
    let result = []
    let lastIndex = 0

    sortedAnnotations.forEach((annotation, index) => {
      // Add text before annotation
      if (annotation.start > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {passage.slice(lastIndex, annotation.start)}
          </span>
        )
      }

      // Add annotated text
      result.push(
        <span
          key={annotation.id}
          className={`${annotation.color} px-1 rounded cursor-pointer relative group`}
          title={annotation.note}
        >
          {annotation.text}
          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {ANNOTATION_TYPES[annotation.type].label}: {annotation.note}
          </span>
        </span>
      )

      lastIndex = annotation.end
    })

    // Add remaining text
    if (lastIndex < passage.length) {
      result.push(
        <span key="text-end">
          {passage.slice(lastIndex)}
        </span>
      )
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{result}</div>
  }

  // Literary analysis helpers
  const analyzeReadingLevel = () => {
    const words = passage.split(/\s+/).length
    const sentences = passage.split(/[.!?]+/).length
    const avgWordsPerSentence = Math.round(words / sentences)
    
    let level = 'Elementary'
    if (avgWordsPerSentence > 20) level = 'Advanced'
    else if (avgWordsPerSentence > 15) level = 'Intermediate'
    
    return { words, sentences, avgWordsPerSentence, level }
  }

  const findLiteraryDevices = () => {
    const devices = []
    
    // Simple pattern matching for common devices
    if (/like|as.*as/.test(passage.toLowerCase())) {
      devices.push('Simile')
    }
    if (/\b(\w+)\s+is\s+(\w+)/.test(passage) && !/like|as/.test(passage.toLowerCase())) {
      devices.push('Metaphor')
    }
    if (/(\w+)\s+\1/.test(passage.toLowerCase())) {
      devices.push('Repetition')
    }
    if (/[.!?]\s*[A-Z][^.!?]*[.!?]\s*[A-Z][^.!?]*[.!?]/.test(passage)) {
      devices.push('Parallel Structure')
    }
    
    return devices
  }

  const stats = analyzeReadingLevel()
  const devices = findLiteraryDevices()

  return (
    <div className={`text-analyzer ${className}`}>
      {/* Passage Header */}
      {(title || author) && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            {title && (
              <CardTitle className="text-xl text-[var(--foreground)]">
                {title}
              </CardTitle>
            )}
            <div className="flex flex-wrap gap-2">
              {author && (
                <Badge variant="secondary">
                  by {author}
                </Badge>
              )}
              {genre && (
                <Badge variant="outline">
                  {genre}
                </Badge>
              )}
              {period && (
                <Badge variant="outline">
                  {period}
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs defaultValue="passage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="passage">Passage</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="annotations">Annotations</TabsTrigger>
        </TabsList>

        {/* Passage Tab */}
        <TabsContent value="passage" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                ref={passageRef}
                className="text-base leading-relaxed text-[var(--foreground)] select-text"
                onMouseUp={handleTextSelection}
              >
                {renderAnnotatedPassage()}
              </div>
            </CardContent>
          </Card>

          {/* Selection Tools */}
          {showAnalysisTools && selectedText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Annotate: "{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}"
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ANNOTATION_TYPES).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <Button
                        key={type}
                        variant={activeAnnotationType === type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveAnnotationType(type as keyof typeof ANNOTATION_TYPES)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {config.label}
                      </Button>
                    )
                  })}
                </div>
                
                <Textarea
                  placeholder="Add your analysis note..."
                  value={annotationNote}
                  onChange={(e) => setAnnotationNote(e.target.value)}
                  className="min-h-[80px]"
                />
                
                <div className="flex gap-2">
                  <Button onClick={addAnnotation} disabled={!annotationNote.trim()}>
                    Add Annotation
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedText('')
                      setSelectionRange(null)
                      setAnnotationNote('')
                      window.getSelection()?.removeAllRanges()
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reading Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <Badge variant="secondary">{stats.words}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Sentences:</span>
                  <Badge variant="secondary">{stats.sentences}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Words/Sentence:</span>
                  <Badge variant="secondary">{stats.avgWordsPerSentence}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Reading Level:</span>
                  <Badge>{stats.level}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Literary Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devices.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {devices.map((device, index) => (
                      <Badge key={index} variant="outline">
                        {device}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    No obvious literary devices detected. Try manual annotation.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Annotations Tab */}
        <TabsContent value="annotations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Annotations</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnnotations(!showAnnotations)}
            >
              <Highlighter className="h-4 w-4 mr-2" />
              {showAnnotations ? 'Hide' : 'Show'} Highlights
            </Button>
          </div>

          {annotations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <p className="text-[var(--muted-foreground)]">
                  No annotations yet. Select text in the passage to add analysis notes.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {annotations.map((annotation) => {
                const Icon = ANNOTATION_TYPES[annotation.type].icon
                return (
                  <Card key={annotation.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="h-4 w-4" />
                            <Badge className={annotation.color}>
                              {ANNOTATION_TYPES[annotation.type].label}
                            </Badge>
                          </div>
                          <blockquote className="border-l-4 border-[var(--border)] pl-4 mb-2">
                            <p className="text-sm italic">"{annotation.text}"</p>
                          </blockquote>
                          <p className="text-sm text-[var(--foreground)]">
                            {annotation.note}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnnotation(annotation.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Specialized component for poetry analysis
export function PoetryAnalyzer({
  poem,
  title,
  author,
  className = ''
}: {
  poem: string
  title?: string
  author?: string
  className?: string
}) {
  const analyzePoetry = () => {
    const lines = poem.split('\n').filter(line => line.trim())
    const stanzas = poem.split('\n\n').length
    
    // Simple rhyme scheme detection (very basic)
    const lastWords = lines.map(line => {
      const words = line.trim().split(/\s+/)
      return words[words.length - 1]?.toLowerCase().replace(/[.,!?;:]/, '') || ''
    })
    
    return {
      lines: lines.length,
      stanzas,
      avgLinesPerStanza: Math.round(lines.length / stanzas),
      lastWords
    }
  }

  const stats = analyzePoetry()

  return (
    <div className={`poetry-analyzer ${className}`}>
      <TextAnalyzer
        passage={poem}
        title={title}
        author={author}
        genre="Poetry"
        showAnalysisTools={true}
      />
      
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Poetry Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Lines:</span>
            <Badge variant="secondary">{stats.lines}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Stanzas:</span>
            <Badge variant="secondary">{stats.stanzas}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Avg. Lines/Stanza:</span>
            <Badge variant="secondary">{stats.avgLinesPerStanza}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
