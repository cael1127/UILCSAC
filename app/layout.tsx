import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import ThemeSwitcher from "@/components/theme-switcher"
import ModernNavigation from "@/components/modern-navigation"
import { getSiteUrl } from "@/lib/site-url"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
  fallback: ['system-ui', 'arial'], // Fallback fonts
})

export const metadata: Metadata = {
  title: {
    default: "UIL CS Academy",
    template: "%s | UIL CS Academy"
  },
  description: "Master competitive programming with our comprehensive platform designed for UIL Computer Science competitions. Practice problems, track progress, and excel in competitions.",
  keywords: ["UIL", "Computer Science", "Competitive Programming", "Java", "Learning Platform"],
  authors: [{ name: "UIL CS Academy Team" }],
  creator: "UIL CS Academy",
  publisher: "UIL CS Academy",
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
    title: "UIL CS Academy",
    description: "Master competitive programming with our comprehensive platform designed for UIL Computer Science competitions.",
    url: '/',
    siteName: 'UIL CS Academy',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UIL CS Academy',
    description: 'Master competitive programming with our comprehensive platform designed for UIL Computer Science competitions.',
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
        
        {/* Performance monitoring for A/B testing */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // A/B Testing Performance Monitoring
                window.addEventListener('load', () => {
                  if ('performance' in window) {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      // Core Web Vitals for A/B testing
                      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
                      const domReady = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
                      
                      // Log performance metrics
                      console.log('A/B Test - Page Load Time:', loadTime, 'ms');
                      console.log('A/B Test - DOM Ready:', domReady, 'ms');
                      
                      // Send to analytics if available
                      if (window.gtag) {
                        window.gtag('event', 'performance_metric', {
                          'event_category': 'A/B Testing',
                          'event_label': 'Page Load',
                          'value': Math.round(loadTime)
                        });
                      }
                    }
                  }
                });
              `,
            }}
          />
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
          <ModernNavigation />
          <main id="main-content" role="main">
            {children}
          </main>
          <ThemeSwitcher />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
