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
}

export default nextConfig
