#!/bin/bash

echo "🚀 Starting QR Code Review System..."
echo "======================================"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 :3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend
echo "🔧 Starting Backend Server..."
cd "/Users/prathmeshd/Desktop/the-review-system 2/backend"
/opt/homebrew/bin/node src/app.js &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Test backend
echo "🔍 Testing backend health..."
curl -s http://localhost:3001/health || echo "Backend health check failed"

# Start frontend in a new terminal window
echo "🎨 Starting Frontend Server..."
cd "/Users/prathmeshd/Desktop/the-review-system 2/frontend"
/opt/homebrew/bin/npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo "======================================"
echo "✅ Both servers should be running now!"
echo "📊 Backend:  http://localhost:3001"
echo "🎨 Frontend: http://localhost:3000"
echo "======================================"
echo "📝 Backend PID: $BACKEND_PID"
echo "📝 Frontend PID: $FRONTEND_PID"
echo "======================================"

# Keep script running
wait