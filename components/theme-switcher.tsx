"use client"

import { useState, useEffect } from 'react'
import { Palette, Sun, Moon, Zap, Waves, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const themes = [
  {
    id: 'theme-ut-orange',
    name: 'UT Orange',
    description: 'Classic UT-inspired theme with warm orange accents',
    icon: Sun,
    gradient: 'gradient-ut',
    primaryColor: 'bg-ut-orange',
    secondaryColor: 'bg-smoky-black',
    preview: 'linear-gradient(135deg, #fb8b24, #0a0903)',
    isDefault: true
  },
  {
    id: 'theme-maroon',
    name: 'Maroon',
    description: 'Deep maroon with light contrast and bold accents',
    icon: Moon,
    gradient: 'gradient-maroon',
    primaryColor: 'bg-falu-red',
    secondaryColor: 'bg-antiflash-white',
    preview: 'linear-gradient(135deg, #7a2121, #323334)',
    isDefault: false
  },
  {
    id: 'theme-warm-sunset',
    name: 'Warm Sunset',
    description: 'Energetic sunset colors with vibrant warmth',
    icon: Sparkles,
    gradient: 'gradient-warm-sunset',
    primaryColor: 'bg-bittersweet',
    secondaryColor: 'bg-maize',
    preview: 'linear-gradient(135deg, #ff785a, var(--maize))',
    isDefault: false
  },
  {
    id: 'theme-ocean-vibes',
    name: 'Ocean Vibes',
    description: 'Cool, refreshing ocean-inspired palette',
    icon: Waves,
    gradient: 'gradient-ocean-vibes',
    primaryColor: 'bg-sea-green',
    secondaryColor: 'bg-electric-blue',
    preview: 'linear-gradient(135deg, #00916e, #65def1)',
    isDefault: false
  },
  {
    id: 'theme-bondi-blue',
    name: 'Bondi Blue',
    description: 'Professional blue theme for focused learning',
    icon: Zap,
    gradient: 'gradient-bondi-blue',
    primaryColor: 'bg-bondi-blue',
    secondaryColor: 'bg-ivory',
    preview: 'linear-gradient(135deg, #0087ac, #f4f9e9)',
    isDefault: false
  }
]

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('theme-ut-orange')
  const [isVisible, setIsVisible] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

    useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selected-theme')
    if (savedTheme && themes.some(theme => theme.id === savedTheme)) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Set default theme
      applyTheme('theme-ut-orange')
    }
  }, [])

  const applyTheme = (themeId: string) => {
    try {
      // Remove all existing theme classes
      document.documentElement.classList.remove('theme-ut-orange', 'theme-maroon', 'theme-warm-sunset', 'theme-ocean-vibes', 'theme-bondi-blue')
      
      // Add the new theme class
      document.documentElement.classList.add(themeId)
    } catch (error) {
      console.error('Error applying theme:', error)
    }
  }

  const changeTheme = (themeId: string) => {
    if (isChanging) return // Prevent multiple rapid changes
    
    setIsChanging(true)
    setCurrentTheme(themeId)
    
    // Apply theme
    applyTheme(themeId)
    
    // Save to localStorage
    localStorage.setItem('selected-theme', themeId)
    
    // Reset changing state and close panel immediately
    setIsChanging(false)
    setIsVisible(false)
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }



  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Enhanced Toggle Button */}
      <Button
        onClick={toggleVisibility}
        className={`
          relative overflow-hidden rounded-full w-14 h-14 shadow-xl
          ${currentTheme === 'theme-ut-orange' ? 'bg-ut-orange hover:bg-ut-orange/90' : 
            currentTheme === 'theme-maroon' ? 'bg-falu-red hover:bg-falu-red/90' :
            currentTheme === 'theme-warm-sunset' ? 'bg-bittersweet hover:bg-bittersweet/90' :
            currentTheme === 'theme-ocean-vibes' ? 'bg-sea-green hover:bg-sea-green/90' :
            'bg-bondi-blue hover:bg-bondi-blue/90'} 
          text-[var(--primary-foreground)] transition-all duration-300 hover:scale-105
        `}
        title="Switch Theme"
      >
        <Palette className="w-6 h-6" />
        {isChanging && (
          <div className="absolute inset-0 bg-[var(--muted)]/20 rounded-full animate-pulse" />
        )}
      </Button>

      {/* Enhanced Theme Selection Panel */}
      {isVisible && (
        <div className="absolute bottom-20 right-0 w-96 animate-slide-up">
          <Card className="w-full shadow-2xl border-0 bg-[var(--card)]/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <Palette className="w-5 h-5 text-smoky-black" />
                  </div>
                  Choose Your Theme
                  {isChanging && (
                    <Badge variant="secondary" className="animate-pulse">
                      Changing...
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-8 w-8 p-0 hover:bg-[var(--muted)] rounded-full text-[var(--muted-foreground)]"
                >
                  <span className="sr-only">Close</span>
                  ×
                </Button>
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mt-2">
                Current: <span className="font-medium">{themes.find(t => t.id === currentTheme)?.name}</span>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {themes.map((theme) => {
                const IconComponent = theme.icon
                const isActive = currentTheme === theme.id
                
                return (
                  <Button
                    key={theme.id}
                    onClick={() => changeTheme(theme.id)}
                    variant="ghost"
                    className={`
                      w-full justify-start h-auto p-4 rounded-xl transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-[var(--muted)] to-[var(--muted)] border-2 border-[var(--border)] shadow-md' 
                        : 'hover:bg-[var(--muted)] border-2 border-transparent hover:border-[var(--border)]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4 w-full">
                      {/* Theme Preview Circle */}
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: theme.preview }}
                      >
                        <IconComponent className="w-6 h-6 text-smoky-black drop-shadow-sm" />
                      </div>
                      
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-[var(--foreground)]">{theme.name}</div>
                          {theme.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          {isActive && (
                            <Badge className="bg-green-500 text-smoky-black text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-[var(--muted-foreground)] mt-1 line-clamp-2">{theme.description}</div>
                      </div>
                      
                      {isActive && (
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </div>
                  </Button>
                )
              })}
              
              {/* Theme Info */}
              <div className="mt-6 p-4 bg-[var(--muted)] rounded-lg">
                <div className="text-sm text-[var(--muted-foreground)]">
                  <strong>💡 Tip:</strong> Your theme preference is saved automatically and will persist across sessions.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
