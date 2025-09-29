"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Code, 
  BookOpen, 
  Trophy, 
  Zap, 
  Users, 
  Target,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  Star,
  Heart,
  Shield,
  Rocket
} from 'lucide-react'

// Force dynamic rendering to avoid React Three Fiber SSR issues
export const dynamic = 'force-dynamic'

export default function Demo3DPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('ut-orange')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const themes = [
    { id: 'ut-orange', name: 'UT Orange', color: '#fb8b24' },
    { id: 'maroon', name: 'Maroon', color: '#7a2121' },
    { id: 'warm-sunset', name: 'Warm Sunset', color: '#ff785a' },
    { id: 'ocean-vibes', name: 'Ocean Vibes', color: '#00916e' },
    { id: 'bondi-blue', name: 'Bondi Blue', color: '#0087ac' }
  ]

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 3000)
  }

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-[var(--muted-foreground)]">Loading 3D Demo...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Simple background instead of 3D */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--primary)]/5 via-[var(--background)] to-[var(--accent)]/5" />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-sm">
          <div className="container-modern py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                  <Sparkles className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">3D Visual Enhancements Demo</h1>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[var(--muted-foreground)]">Theme:</span>
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="px-3 py-1 rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                >
                  {themes.map(theme => (
                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </header>

        <div className="container-modern py-8">
          <Tabs defaultValue="cards" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 bg-[var(--card)] border border-[var(--border)] p-1 rounded-xl">
              <TabsTrigger value="cards">3D Cards</TabsTrigger>
              <TabsTrigger value="progress">Progress Rings</TabsTrigger>
              <TabsTrigger value="loading">Loading States</TabsTrigger>
              <TabsTrigger value="interactions">Interactions</TabsTrigger>
            </TabsList>

            {/* 3D Cards Demo */}
            <TabsContent value="cards" className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-[var(--foreground)]">3D Card Components</h2>
                <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Experience the enhanced depth and interactivity of our 3D card system with hover effects, 
                  glow animations, and smooth transitions.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[var(--primary)]/10">
                        <Code className="h-6 w-6 text-[var(--primary)]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Java Programming</CardTitle>
                        <CardDescription>Master the fundamentals</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--muted-foreground)]">Progress</span>
                        <Badge variant="secondary">75%</Badge>
                      </div>
                      <div className="w-full bg-[var(--muted)] rounded-full h-2">
                        <div className="bg-[var(--primary)] h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                        <span>Variables & Data Types</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[var(--accent)]/10">
                        <BookOpen className="h-6 w-6 text-[var(--accent)]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Literature</CardTitle>
                        <CardDescription>Reading comprehension</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--muted-foreground)]">Progress</span>
                        <Badge variant="secondary">45%</Badge>
                      </div>
                      <div className="w-full bg-[var(--muted)] rounded-full h-2">
                        <div className="bg-[var(--accent)] h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                        <span>Poetry Analysis</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-[var(--warning)]/10">
                        <Trophy className="h-6 w-6 text-[var(--warning)]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Mathematics</CardTitle>
                        <CardDescription>Problem solving</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--muted-foreground)]">Progress</span>
                        <Badge variant="secondary">90%</Badge>
                      </div>
                      <div className="w-full bg-[var(--muted)] rounded-full h-2">
                        <div className="bg-[var(--warning)] h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                        <span>Algebra</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Progress Rings Demo */}
            <TabsContent value="progress" className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-[var(--foreground)]">3D Progress Visualization</h2>
                <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Beautiful 3D progress rings that bring your learning journey to life with depth and animation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--muted)]"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--primary)] border-t-transparent" style={{ transform: 'rotate(270deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[var(--foreground)]">75%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Java</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">75% Complete</p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--muted)]"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--accent)] border-t-transparent" style={{ transform: 'rotate(162deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[var(--foreground)]">45%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Literature</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">45% Complete</p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--muted)]"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--warning)] border-t-transparent" style={{ transform: 'rotate(324deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[var(--foreground)]">90%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Mathematics</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">90% Complete</p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--muted)]"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-[var(--secondary)] border-t-transparent" style={{ transform: 'rotate(108deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[var(--foreground)]">30%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">Literature</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">30% Complete</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Loading States Demo */}
            <TabsContent value="loading" className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-[var(--foreground)]">3D Loading Animations</h2>
                <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Engaging 3D loading states that keep users engaged while content loads.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary)]"></div>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)]">Standard Loading</h3>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[var(--accent)]"></div>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)]">Large Loading</h3>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--warning)]"></div>
                  </div>
                  <h3 className="font-semibold text-[var(--foreground)]">Compact Loading</h3>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[var(--foreground)] text-center">Skeleton Loading</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse"></div>
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/2"></div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse"></div>
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-[var(--muted)] rounded animate-pulse w-1/2"></div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Interactions Demo */}
            <TabsContent value="interactions" className="space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-[var(--foreground)]">Interactive 3D Elements</h2>
                <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                  Experience the smooth interactions and micro-animations that make the interface feel alive.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-center space-y-4">
                    <Rocket className="h-16 w-16 mx-auto text-[var(--primary)]" />
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">Launch Learning</h3>
                    <p className="text-[var(--muted-foreground)]">
                      Start your journey with interactive 3D elements that respond to your touch.
                    </p>
                  </div>
                </Card>

                <Card className="p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="text-center space-y-4">
                    <Heart className="h-16 w-16 mx-auto text-[var(--accent)]" />
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">Engaging Experience</h3>
                    <p className="text-[var(--muted-foreground)]">
                      Feel the connection with every interaction through smooth animations.
                    </p>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Button Loading States</h3>
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleLoadingDemo} className="px-8" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Start Loading Demo</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[Star, Shield, Trophy, Zap].map((Icon, index) => (
                  <Card key={index} className="p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <Icon className="h-8 w-8 mx-auto mb-2 text-[var(--primary)]" />
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {Icon.name}
                    </p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}