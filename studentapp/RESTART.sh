#!/bin/bash

echo "=========================================="
echo "   Restarting Tracksy Student App"
echo "=========================================="
echo ""

# Kill any existing instances
echo "🛑 Stopping any running instances..."
pkill -f "react-router.*19007" 2>/dev/null || true
pkill -f "vite.*19007" 2>/dev/null || true
sleep 2

# Check Laravel backend
echo ""
echo "🔍 Checking Laravel backend..."
if curl -s http://localhost:8000/api > /dev/null 2>&1; then
    echo "✅ Laravel backend is running (http://localhost:8000/api)"
else
    echo "❌ Laravel backend is NOT running!"
    echo ""
    echo "Please start it first:"
    echo "  cd /home/irfan/tracksy/backend"
    echo "  php artisan serve"
    echo ""
    exit 1
fi

# Clean and start
echo ""
echo "🧹 Cleaning build cache..."
rm -rf build .react-router node_modules/.vite 2>/dev/null

echo ""
echo "🚀 Starting Student App..."
echo ""
npm run web

