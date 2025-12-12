#!/bin/bash

echo "🚀 Starting BookByBlock Development Environment"
echo "=============================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.example to .env and configure your API keys."
    exit 1
fi

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "node.*3001" 2>/dev/null || true

# Clear ports
for port in 3000 3001; do
    lsof -ti:${port} | xargs kill -9 2>/dev/null || true
done

echo "✅ Ports cleared"

# Start backend
echo "🔧 Starting backend on port 3001..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Development environment started!"
echo ""
echo "📱 Access applications:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - API Docs: http://localhost:3001/docs"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
