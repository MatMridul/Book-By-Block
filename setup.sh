#!/bin/bash

# 🚀 BookByBlock Setup Script
# Enterprise Web3 Ticketing Platform

echo "🎫 Setting up BookByBlock - Web3 Anti-Scalping Platform"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Installing Docker is recommended for full development experience."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup environment file
if [ ! -f .env ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file. Please update with your API keys."
fi

# Install all workspace dependencies
echo "📦 Installing workspace dependencies..."
npm run install:all

# Setup Git hooks
echo "🔗 Setting up Git hooks..."
npx husky install

# Build all projects
echo "🏗️  Building all projects..."
npm run build:all

# Setup Docker environment
if command -v docker &> /dev/null; then
    echo "🐳 Setting up Docker environment..."
    docker-compose build
    echo "✅ Docker images built successfully"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. 🔑 Update .env file with your API keys:"
echo "   - Get Alchemy API key: https://alchemy.com"
echo "   - Get testnet MATIC: https://faucet.polygon.technology"
echo ""
echo "2. 🚀 Start development environment:"
echo "   npm run dev:all"
echo ""
echo "3. 🐳 Or use Docker (recommended):"
echo "   docker-compose up -d"
echo ""
echo "4. 📱 Access applications:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Scanner: http://localhost:3002"
echo "   - Monitoring: http://localhost:3003"
echo ""
echo "5. 🔗 Deploy contracts:"
echo "   npm run deploy:local    # Local development"
echo "   npm run deploy:testnet  # Mumbai testnet"
echo ""
echo "📚 Read the docs: ./docs/README.md"
echo "🐛 Report issues: https://github.com/your-username/bookbyblock/issues"
echo ""
echo "Happy hacking! 🚀"
