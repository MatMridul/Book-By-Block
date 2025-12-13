/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Static export for S3 hosting
  output: 'export',
  trailingSlash: true,
  
  // PWA configuration
  experimental: {
    appDir: true
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
  },
  
  // Image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false
    };
    return config;
  }
};

module.exports = nextConfig;
