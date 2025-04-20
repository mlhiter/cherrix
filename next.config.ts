import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // https://www.npmjs.com/package/react-pdf
  turbopack: {
    resolveAlias: {
      canvas: './empty-module.ts',
    },
  },

  reactStrictMode: false, // https://www.blocknotejs.org/docs/advanced/nextjs#react-19--next-15-strictmode
  serverExternalPackages: ['pdf-parse'], //https://stackoverflow.com/questions/76345917/read-pdf-content-in-next-js-13-api-route-handler-results-in-404

  async headers() {
    //https://webcontainers.io/guides/quickstart
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },

  // for rss blog image
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
