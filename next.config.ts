import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://220.231.94.117:8081/api/v1/:path*',
      },
    ]
  },
}

export default nextConfig
