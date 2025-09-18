"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Menu, 
  X, 
  User, 
  LogOut,
  Settings,
  BookOpen,
  Trophy,
  Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ModernNavigationProps {
  user?: {
    id: string;
    email: string;
    name?: string;
  } | null;
  onLogout?: () => void;
}

export default function ModernNavigation({ user, onLogout }: ModernNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<ModernNavigationProps['user'] | null>(user ?? null);
  const router = useRouter();

  // Sync with Supabase auth state on the client
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        const sUser = data?.session?.user;
        if (sUser) {
          setAuthUser({ id: sUser.id, email: sUser.email || '' });
        } else {
          setAuthUser(null);
        }
      } catch {
        // ignore
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sUser = session?.user;
      setAuthUser(sUser ? { id: sUser.id, email: sUser.email || '' } : null);
    });

    init();
    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (onLogout) {
        onLogout();
        return;
      }
      await supabase.auth.signOut();
      setAuthUser(null);
      router.push('/auth/login');
    } catch {
      // ignore
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation" aria-label="Primary">
      <div className="container-modern">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Code className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">UIL CS Academy</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {authUser ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {authUser.name || authUser.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="btn-outline"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm" className="btn-outline">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="btn-primary">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-outline"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t bg-background">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile User Menu */}
              <div className="border-t pt-4 mt-4">
                {authUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {authUser.name || authUser.email}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {authUser.email}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full justify-start btn-outline"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 px-3">
                    <Button asChild variant="outline" size="sm" className="w-full btn-outline">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button asChild size="sm" className="w-full btn-primary">
                      <Link href="/auth/sign-up">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

