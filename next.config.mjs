/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'www.citixoservices.com'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: false,
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['mongoose'],
    // Optimize for SSR
    optimizeCss: true,
    // Enable static optimization
    staticPageGenerationTimeout: 1000,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  poweredByHeader: false,
  // SEO optimizations
  trailingSlash: false,
  generateEtags: true,
  compress: true,
  // Enable static generation for better SEO
  output: 'standalone',
  // Optimize for search engines
  generateBuildId: async () => {
    return 'citixo-services-build'
  },
  // Simplified webpack configuration to fix chunk loading issues
  webpack: (config, { dev }) => {
    // Fix file watching in development
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      }
    }
    
    return config
  },
  // Headers for better SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
    ]
  },
}

export default nextConfig