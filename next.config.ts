import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.PAGES_BASE_PATH,
  images: {
    unoptimized: true
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.glsl/,
      type: 'asset/source',
    })
    return config
  },
  turbopack: {
    rules: {
      '*.glsl': {
        loaders: ['raw-loader'],
        as: '*.js'
      }
    }
  }
}

export default nextConfig
