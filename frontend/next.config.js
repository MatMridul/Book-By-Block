/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_BLOCKCHAIN_RPC: process.env.NEXT_PUBLIC_BLOCKCHAIN_RPC || 'http://localhost:8545',
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID || '31337'
  },
  
  // Image optimization
  images: {
    domains: ['api.bookbyblock.com', 'localhost']
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
  },

  // Output configuration for deployment
  output: 'standalone'
};

module.exports = nextConfig;
