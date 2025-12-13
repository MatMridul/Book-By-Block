/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Static export for S3 hosting
  output: 'export',
  trailingSlash: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SCANNER_URL: process.env.NEXT_PUBLIC_SCANNER_URL || 'https://scanner.bookbyblock.com',
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '137'
  },
  
  // Image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Webpack configuration for Web3
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
