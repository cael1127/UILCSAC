import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import ThemeSwitcher from "@/components/theme-switcher"
import ModernNavigation from "@/components/modern-navigation"
import { MathJaxProvider } from "@/components/tools/math-renderer"
import { getSiteUrl } from "@/lib/site-url"
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['system-ui', 'arial'], // Fallback fonts
})

export const metadata: Metadata = {
  title: {
    default: "UIL Academy",
    template: "%s | UIL Academy"
  },
  description: "Master all UIL competitions with our comprehensive platform covering Computer Science, Mathematics, Science, Literature, and Spelling. Structured learning paths, practice problems, and progress tracking.",
  keywords: ["UIL", "Computer Science", "Mathematics", "Science", "Literature", "Spelling", "Competition", "Learning Platform"],
  authors: [{ name: "UIL Academy Team" }],
  creator: "UIL Academy",
  publisher: "UIL Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "UIL Academy",
    description: "Master all UIL competitions with our comprehensive platform covering Computer Science, Mathematics, Science, Literature, and Spelling.",
    url: '/',
    siteName: 'UIL Academy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UIL Academy',
    description: 'Master all UIL competitions with our comprehensive platform covering Computer Science, Mathematics, Science, Literature, and Spelling.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="dns-prefetch" href={`//${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname}`} />
        )}
      </head>
      <body className={inter.className}>
        {/* Skip to content for keyboard users */}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthErrorBoundary>
            <MathJaxProvider>
              <ModernNavigation />
              <main id="main-content" role="main">
                {children}
              </main>
              <ThemeSwitcher />
              <Toaster />
            </MathJaxProvider>
          </AuthErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}
