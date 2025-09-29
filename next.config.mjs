/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude Supabase Edge Functions from Next.js build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  
  // Netlify configuration
  trailingSlash: false,
  output: 'standalone',
  
  // Netlify specific optimizations
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // External packages for server components (moved from experimental in Next.js 15.2.4)
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  
  // Ensure proper environment variable handling
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Handle Edge Runtime compatibility issues
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        '@supabase/supabase-js': 'commonjs @supabase/supabase-js',
        '@supabase/ssr': 'commonjs @supabase/ssr',
      })
    }
    
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compression
  compress: true,
  
  // Powered by header
  poweredByHeader: false,
  
  // React strict mode for better development
  reactStrictMode: true,
  
  // Next 15 uses SWC by default; remove deprecated swcMinify flag
  
  // Serve .wasm files with correct MIME type for future WebAssembly support
  async headers() {
    return [
      {
        source: '/:path*.wasm',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
    ];
  },
}

export default nextConfig
