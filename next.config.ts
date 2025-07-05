import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers for mobile deployment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Mobile-optimized redirects - V3 only
  async redirects() {
    return [
      {
        source: '/',
        destination: '/mobile-v3',
        permanent: false,
      },
      {
        source: '/dashboard/:path*',
        destination: '/mobile-v3',
        permanent: false,
      },
      {
        source: '/mobile',
        destination: '/mobile-v3',
        permanent: false,
      },
      {
        source: '/mobile/:path*',
        destination: '/mobile-v3',
        permanent: false,
      },
      {
        source: '/mobile-v2',
        destination: '/mobile-v3',
        permanent: false,
      },
      {
        source: '/mobile-v2/:path*',
        destination: '/mobile-v3',
        permanent: false,
      },
    ];
  },
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Exclude update folder from build
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: []
    };
  },
  
  // Output configuration for Vercel
  output: 'standalone',
  
  // Experimental features for mobile performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
