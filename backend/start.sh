#!/bin/bash

echo "🚀 Starting BookByBlock Backend API..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your blockchain credentials!"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "🏗️  Building TypeScript..."
npm run build

# Start server
echo "🎫 Starting API server..."
echo "📡 Server will be available at: http://localhost:3001"
echo "📚 API docs will be at: http://localhost:3001/docs"
echo ""

npm run dev
