"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Menu, X, User, LogOut, Home, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Navigation3DProps {
  user?: {
    id: string
    email: string
    name?: string
  } | null
  onLogout?: () => void
}

export default function Navigation3D({ user, onLogout }: Navigation3DProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [authUser, setAuthUser] = useState<Navigation3DProps['user'] | null>(user ?? null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setAuthUser({ 
            id: session.user.id, 
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name
          })
        } else {
          setAuthUser(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        setAuthUser(null)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser({ 
          id: session.user.id, 
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name
        })
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout()
        return
      }
      await supabase.auth.signOut()
      setAuthUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!mounted) {
    return null
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: Trophy },
  ]

  const NavItem = ({ item, index }: { item: typeof navigation[0], index: number }) => {
    const Icon = item.icon
    
    return (
      <motion.div
        className="relative"
        onHoverStart={() => setHoveredItem(item.name)}
        onHoverEnd={() => setHoveredItem(null)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          href={item.href}
          className="group flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 relative py-2 px-3 rounded-lg hover:bg-muted/50"
        >
          {/* 3D Icon Container */}
          <div className="relative">
            <motion.div
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
              whileHover={{ 
                rotateY: 180,
                transition: { duration: 0.6, ease: "easeInOut" }
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
            </motion.div>
            
            {/* 3D Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-lg blur-sm opacity-0 group-hover:opacity-30"
              style={{
                background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                transform: 'translateZ(-1px)'
              }}
              animate={{
                opacity: hoveredItem === item.name ? 0.3 : 0
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <span className="relative">
            {item.name}
            <motion.span
              className="absolute -bottom-1 left-0 h-0.5 bg-primary"
              initial={{ width: 0 }}
              animate={{ width: hoveredItem === item.name ? '100%' : 0 }}
              transition={{ duration: 0.3 }}
            />
          </span>
        </Link>
      </motion.div>
    )
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300" role="navigation" aria-label="Primary">
      <div className="container-modern">
        <div className="flex h-16 items-center justify-between">
          {/* 3D Logo */}
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2 group transition-all duration-300">
              <motion.div 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/25"
                whileHover={{ 
                  rotateY: 360,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Code className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
              </motion.div>
              <motion.span 
                className="text-lg font-semibold text-foreground transition-colors duration-300 group-hover:text-primary"
                animate={{
                  color: hoveredItem === 'logo' ? 'var(--primary)' : 'var(--foreground)'
                }}
              >
                UIL Academy
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item, index) => (
              <NavItem key={item.name} item={item} index={index} />
            ))}
          </div>

        {/* User Menu / Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {authUser ? (
              <motion.div 
                className="flex items-center space-x-4 animate-fade-in"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="flex items-center space-x-2 group"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div 
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110"
                    whileHover={{ 
                      rotateZ: 360,
                      transition: { duration: 0.6, ease: "easeInOut" }
                    }}
                  >
                    <User className="h-4 w-4 text-primary transition-transform duration-300 group-hover:rotate-12" />
                  </motion.div>
                  <span className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
                    {authUser.name || authUser.email}
                  </span>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="btn-outline btn-interactive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                    Sign Out
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                className="flex items-center space-x-2 animate-fade-in"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="outline" size="sm" className="btn-outline btn-interactive">
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild size="sm" className="btn-primary btn-interactive hover:shadow-lg hover:shadow-primary/25">
                    <Link href="/auth/sign-up">Get Started</Link>
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn-outline"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              id="mobile-menu"
              className="md:hidden border-t bg-background"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-1 px-2 pb-3 pt-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        className="group flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <motion.div
                          className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
                          whileHover={{ rotateY: 180 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                        </motion.div>
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  )
                })}
                
        {/* Mobile User Menu */}
        <div className="border-t pt-4 mt-4">
          {authUser ? (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-2 px-3 py-2">
                        <motion.div 
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
                          whileHover={{ rotateZ: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <User className="h-4 w-4 text-primary" />
                        </motion.div>
                        <div>
                        <div className="text-sm font-medium text-foreground">
                          {authUser.name || authUser.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {authUser.email}
                        </div>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleLogout()
                            setIsMenuOpen(false)
                          }}
                          className="w-full justify-start btn-outline"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-2 px-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button asChild variant="outline" size="sm" className="w-full btn-outline">
                          <Link href="/auth/login">Sign In</Link>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button asChild size="sm" className="w-full btn-primary">
                          <Link href="/auth/sign-up">Get Started</Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
