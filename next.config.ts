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
  serverExternalPackages: ['pdf-parse'], //https://stackoverflow.com/questions/76345917/read-pdf-content-in-next-js-13-api-route-handler-results-in-404

  async headers() {
    //https://webcontainers.io/guides/quickstart
    return [
      {
        source: '/client/code',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
