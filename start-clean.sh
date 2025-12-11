#!/bin/bash

echo "🧹 Starting BookByBlock with clean environment..."

# Kill any existing processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Clear ports
for port in 3000 3001 3002; do
    lsof -ti:${port} | xargs kill -9 2>/dev/null || true
done

echo "✅ Cleaned existing processes"

# Start frontend only (clean demo)
cd frontend
echo "🚀 Starting frontend on port 3000..."
npm run dev

echo "📱 Open http://localhost:3000 to see your demo!"
