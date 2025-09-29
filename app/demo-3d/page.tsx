"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FloatingBackground from '@/components/3d/FloatingBackground'
import Card3D from '@/components/3d/Card3D'
import { Icon3D } from '@/components/3d/Card3D'
import ProgressRing3D, { LoadingSpinner3D } from '@/components/3d/ProgressRing3D'
import Loading3D, { PageTransition3D, ButtonLoading3D, Skeleton3D, CardSkeleton3D } from '@/components/3d/Loading3D'
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

export default function Demo3DPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('ut-orange')

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

  return (
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* 3D Floating Background */}
      <FloatingBackground theme={selectedTheme} intensity={15} />
      
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
              <PageTransition3D>
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-[var(--foreground)]">3D Card Components</h2>
                  <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                    Experience the enhanced depth and interactivity of our 3D card system with hover effects, 
                    glow animations, and smooth transitions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card3D className="h-full" hoverScale={1.08} glowColor="var(--primary)">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Icon3D icon={Code} className="h-8 w-8" color="var(--primary)" size={32} />
                        <CardTitle>Computer Science</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        Master Java programming, algorithms, and data structures for UIL competitions.
                      </CardDescription>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>25+ Learning Paths</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>500+ Practice Problems</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Real-time Code Execution</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card3D>

                  <Card3D className="h-full" hoverScale={1.08} glowColor="var(--accent)">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Icon3D icon={BookOpen} className="h-8 w-8" color="var(--accent)" size={32} />
                        <CardTitle>Mathematics</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        Excel in Number Sense, Calculator Applications, and General Math.
                      </CardDescription>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Mental Math Techniques</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Formula Reference</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Speed Practice</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card3D>

                  <Card3D className="h-full" hoverScale={1.08} glowColor="var(--warning)">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Icon3D icon={Trophy} className="h-8 w-8" color="var(--warning)" size={32} />
                        <CardTitle>Achievements</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">
                        Track your progress and unlock achievements as you master UIL subjects.
                      </CardDescription>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Progress Tracking</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Badge System</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CheckCircle className="h-4 w-4 text-[var(--success)] mr-2" />
                          <span>Leaderboards</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card3D>
                </div>
              </PageTransition3D>
            </TabsContent>

            {/* Progress Rings Demo */}
            <TabsContent value="progress" className="space-y-8">
              <PageTransition3D>
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-[var(--foreground)]">3D Progress Visualization</h2>
                  <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                    Beautiful 3D progress rings that bring your learning journey to life with depth and animation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="text-center space-y-4">
                    <ProgressRing3D 
                      progress={75} 
                      size={120} 
                      thickness={12}
                      color="var(--primary)"
                    />
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">Computer Science</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">75% Complete</p>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <ProgressRing3D 
                      progress={45} 
                      size={120} 
                      thickness={12}
                      color="var(--accent)"
                    />
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">Mathematics</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">45% Complete</p>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <ProgressRing3D 
                      progress={90} 
                      size={120} 
                      thickness={12}
                      color="var(--success)"
                    />
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">Science</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">90% Complete</p>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <ProgressRing3D 
                      progress={30} 
                      size={120} 
                      thickness={12}
                      color="var(--warning)"
                    />
                    <div>
                      <h3 className="font-semibold text-[var(--foreground)]">Literature</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">30% Complete</p>
                    </div>
                  </div>
                </div>
              </PageTransition3D>
            </TabsContent>

            {/* Loading States Demo */}
            <TabsContent value="loading" className="space-y-8">
              <PageTransition3D>
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-[var(--foreground)]">3D Loading Animations</h2>
                  <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                    Engaging 3D loading states that keep users engaged while content loads.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="text-center space-y-4">
                    <Loading3D message="Loading content..." size="md" />
                    <h3 className="font-semibold text-[var(--foreground)]">Standard Loading</h3>
                  </div>

                  <div className="text-center space-y-4">
                    <Loading3D message="Processing data..." size="lg" />
                    <h3 className="font-semibold text-[var(--foreground)]">Large Loading</h3>
                  </div>

                  <div className="text-center space-y-4">
                    <Loading3D message="Almost ready..." size="sm" />
                    <h3 className="font-semibold text-[var(--foreground)]">Compact Loading</h3>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-[var(--foreground)] text-center">Skeleton Loading</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CardSkeleton3D />
                    <CardSkeleton3D />
                  </div>
                </div>
              </PageTransition3D>
            </TabsContent>

            {/* Interactions Demo */}
            <TabsContent value="interactions" className="space-y-8">
              <PageTransition3D>
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-[var(--foreground)]">Interactive 3D Elements</h2>
                  <p className="text-[var(--muted-foreground)] max-w-2xl mx-auto">
                    Experience the smooth interactions and micro-animations that make the interface feel alive.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card3D className="p-8" hoverScale={1.05} glowColor="var(--primary)">
                    <div className="text-center space-y-4">
                      <Icon3D icon={Rocket} className="h-16 w-16 mx-auto" color="var(--primary)" size={64} />
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">Hover Interactions</h3>
                      <p className="text-[var(--muted-foreground)]">
                        Hover over this card to see the 3D lift effect, glow animation, and floating particles.
                      </p>
                    </div>
                  </Card3D>

                  <Card3D className="p-8" hoverScale={1.05} glowColor="var(--accent)">
                    <div className="text-center space-y-4">
                      <Icon3D icon={Heart} className="h-16 w-16 mx-auto" color="var(--accent)" size={64} />
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">Icon Animations</h3>
                      <p className="text-[var(--muted-foreground)]">
                        Icons rotate and scale with smooth 3D transitions on hover.
                      </p>
                    </div>
                  </Card3D>
                </div>

                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-[var(--foreground)]">Button Loading States</h3>
                  <div className="flex justify-center space-x-4">
                    <ButtonLoading3D isLoading={isLoading}>
                      <Button onClick={handleLoadingDemo} className="px-8">
                        <Zap className="h-4 w-4 mr-2" />
                        {isLoading ? 'Processing...' : 'Start Loading Demo'}
                      </Button>
                    </ButtonLoading3D>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[Star, Shield, Trophy, Zap].map((Icon, index) => (
                    <Card3D key={index} className="p-4 text-center" hoverScale={1.1} glowColor="var(--primary)">
                      <Icon3D 
                        icon={Icon} 
                        className="h-8 w-8 mx-auto mb-2" 
                        color="var(--primary)" 
                        size={32} 
                      />
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {Icon.name}
                      </p>
                    </Card3D>
                  ))}
                </div>
              </PageTransition3D>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
