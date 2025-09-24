/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
    unoptimized: false,
  },
  experimental: {
    // Removed optimizeCss to fix critters module issue
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  poweredByHeader: false,
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
}

export default nextConfig