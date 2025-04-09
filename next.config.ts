import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  // https://www.npmjs.com/package/react-pdf
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  },
}

export default nextConfig
