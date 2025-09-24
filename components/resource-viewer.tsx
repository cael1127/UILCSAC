"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  FileText, 
  Calculator, 
  HelpCircle,
  Download,
  ExternalLink,
  Search
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { MathJaxProvider, MixedContentRenderer } from '@/components/tools/math-renderer'

interface SubjectResource {
  id: string
  subject_id: string
  title: string
  description: string | null
  resource_type: 'glossary' | 'formula_sheet' | 'reference_guide' | 'practice_guide'
  content: string | null
  file_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ResourceViewerProps {
  subjectName: string
  className?: string
}

const RESOURCE_ICONS = {
  'glossary': BookOpen,
  'formula_sheet': Calculator,
  'reference_guide': FileText,
  'practice_guide': HelpCircle,
} as const

const RESOURCE_COLORS = {
  'glossary': 'bg-blue-100 text-blue-800',
  'formula_sheet': 'bg-green-100 text-green-800',
  'reference_guide': 'bg-purple-100 text-purple-800',
  'practice_guide': 'bg-orange-100 text-orange-800',
} as const

export default function ResourceViewer({ subjectName, className = '' }: ResourceViewerProps) {
  const [resources, setResources] = useState<SubjectResource[]>([])
  const [selectedResource, setSelectedResource] = useState<SubjectResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadResources()
  }, [subjectName])

  const loadResources = async () => {
    try {
      setLoading(true)

      // Get subject ID first
      const { data: subjectData } = await supabase
        .from('subjects')
        .select('id')
        .eq('name', subjectName)
        .single()

      if (!subjectData) {
        console.error('Subject not found:', subjectName)
        return
      }

      // Load resources for this subject
      const { data: resourcesData, error } = await supabase
        .from('subject_resources')
        .select('*')
        .eq('subject_id', subjectData.id)
        .eq('is_active', true)
        .order('title', { ascending: true })

      if (error) {
        console.error('Error loading resources:', error)
        return
      }

      setResources(resourcesData || [])
      
      // Auto-select first resource if available
      if (resourcesData && resourcesData.length > 0) {
        setSelectedResource(resourcesData[0])
      }

    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = resources.filter(resource =>
    !searchTerm || 
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resourcesByType = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.resource_type]) {
      acc[resource.resource_type] = []
    }
    acc[resource.resource_type].push(resource)
    return acc
  }, {} as Record<string, SubjectResource[]>)

  const renderResourceContent = (resource: SubjectResource) => {
    if (!resource.content) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <p className="text-[var(--muted-foreground)]">No content available for this resource.</p>
        </div>
      )
    }

    // Check if content contains math/LaTeX
    const containsMath = /\$.*?\$|\\\[.*?\\\]|\\begin\{.*?\}/.test(resource.content)

    if (containsMath) {
      return (
        <MathJaxProvider>
          <div className="prose prose-sm max-w-none text-[var(--foreground)]">
            <MixedContentRenderer content={resource.content} />
          </div>
        </MathJaxProvider>
      )
    }

    // Render as markdown-style content
    return (
      <div className="prose prose-sm max-w-none text-[var(--foreground)]">
        <div 
          className="whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: resource.content
              .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-[var(--foreground)]">$1</h1>')
              .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-[var(--foreground)]">$1</h2>')
              .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-[var(--foreground)]">$1</h3>')
              .replace(/^\*\*(.*?)\*\*/gm, '<strong class="font-semibold">$1</strong>')
              .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
              .replace(/\n\n/g, '</p><p class="mb-4">')
              .replace(/^(?!<[h|l])/gm, '<p class="mb-4">')
          }}
        />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (resources.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No Resources Available
          </h3>
          <p className="text-[var(--muted-foreground)]">
            Resources for this subject are coming soon. Check back later!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`resource-viewer ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="space-y-3">
            {Object.entries(resourcesByType).map(([type, typeResources]) => {
              const IconComponent = RESOURCE_ICONS[type as keyof typeof RESOURCE_ICONS]
              return (
                <div key={type}>
                  <h3 className="text-sm font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wide">
                    {type.replace('_', ' ')}
                  </h3>
                  <div className="space-y-2">
                    {typeResources.map((resource) => (
                      <Card 
                        key={resource.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedResource?.id === resource.id ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/5' : ''
                        }`}
                        onClick={() => setSelectedResource(resource)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                              <IconComponent className="h-4 w-4 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-[var(--foreground)] truncate">
                                {resource.title}
                              </h4>
                              {resource.description && (
                                <p className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                              )}
                              <Badge 
                                className={`mt-2 text-xs ${RESOURCE_COLORS[resource.resource_type]}`}
                              >
                                {resource.resource_type.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resource Content */}
        <div className="lg:col-span-2">
          {selectedResource ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-[var(--foreground)]">
                      {selectedResource.title}
                    </CardTitle>
                    {selectedResource.description && (
                      <CardDescription className="mt-2">
                        {selectedResource.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedResource.file_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={selectedResource.file_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open File
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => {
                      // Simple download of content as text file
                      const blob = new Blob([selectedResource.content || ''], { type: 'text/plain' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${selectedResource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
                      a.click()
                      window.URL.revokeObjectURL(url)
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {renderResourceContent(selectedResource)}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
                <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  Select a Resource
                </h3>
                <p className="text-[var(--muted-foreground)]">
                  Choose a resource from the list to view its content.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
