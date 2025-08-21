"use client"

import { useState, useEffect } from 'react'
import { Palette, Sun, Moon, Zap, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const themes = [
  {
    id: 'theme-ut-orange',
    name: 'UT Orange',
    description: 'Original UT-inspired theme',
    icon: Sun,
    gradient: 'gradient-ut',
    primaryColor: 'bg-ut-orange',
    secondaryColor: 'bg-smoky-black'
  },
  {
    id: 'theme-warm-sunset',
    name: 'Warm Sunset',
    description: 'Warm, energetic sunset colors',
    icon: Sun,
    gradient: 'gradient-warm-sunset',
    primaryColor: 'bg-bittersweet',
    secondaryColor: 'bg-maize'
  },
  {
    id: 'theme-ocean-vibes',
    name: 'Ocean Vibes',
    description: 'Cool, refreshing ocean colors',
    icon: Waves,
    gradient: 'gradient-ocean-vibes',
    primaryColor: 'bg-sea-green',
    secondaryColor: 'bg-electric-blue'
  },
  {
    id: 'theme-bondi-blue',
    name: 'Bondi Blue',
    description: 'Professional blue theme',
    icon: Zap,
    gradient: 'gradient-bondi-blue',
    primaryColor: 'bg-bondi-blue',
    secondaryColor: 'bg-ivory'
  }
]

export default function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState('theme-ut-orange')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selected-theme')
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      document.documentElement.className = savedTheme
    } else {
      // Set default theme
      document.documentElement.className = 'theme-ut-orange'
    }
  }, [])

  const changeTheme = (themeId: string) => {
    setCurrentTheme(themeId)
    document.documentElement.className = themeId
    localStorage.setItem('selected-theme', themeId)
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <Button
        onClick={toggleVisibility}
        className={`${currentTheme === 'theme-ut-orange' ? 'bg-ut-orange hover:bg-ut-orange/90' : 
                   currentTheme === 'theme-warm-sunset' ? 'bg-bittersweet hover:bg-bittersweet/90' :
                   currentTheme === 'theme-ocean-vibes' ? 'bg-sea-green hover:bg-sea-green/90' :
                   'bg-bondi-blue hover:bg-bondi-blue/90'} text-white rounded-full w-12 h-12 shadow-lg`}
        title="Switch Theme"
      >
        <Palette className="w-5 h-5" />
      </Button>

      {/* Theme Selection Panel */}
      {isVisible && (
        <Card className="absolute bottom-16 right-0 w-80 shadow-xl border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Choose Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {themes.map((theme) => {
              const IconComponent = theme.icon
              const isActive = currentTheme === theme.id
              
              return (
                <Button
                  key={theme.id}
                  onClick={() => changeTheme(theme.id)}
                  variant={isActive ? "default" : "outline"}
                  className={`w-full justify-start h-auto p-3 ${
                    isActive 
                      ? `${theme.id === 'theme-ut-orange' ? 'bg-ut-orange hover:bg-ut-orange/90' : 
                         theme.id === 'theme-warm-sunset' ? 'bg-bittersweet hover:bg-bittersweet/90' :
                         theme.id === 'theme-ocean-vibes' ? 'bg-sea-green hover:bg-sea-green/90' :
                         'bg-bondi-blue hover:bg-bondi-blue/90'} text-white` 
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-8 h-8 rounded-full ${theme.primaryColor} flex items-center justify-center`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{theme.name}</div>
                      <div className="text-xs opacity-80">{theme.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Click outside to close */}
      {isVisible && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={toggleVisibility}
        />
      )}
    </div>
  )
}
