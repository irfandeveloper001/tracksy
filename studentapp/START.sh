#!/bin/bash

echo "=========================================="
echo "   Tracksy Student App - Start Script"
echo "=========================================="
echo ""

# Check if Laravel backend is running
echo "🔍 Checking Laravel backend..."
if curl -s http://localhost:8000/api > /dev/null 2>&1; then
    echo "✅ Laravel backend is running"
else
    echo "❌ Laravel backend is NOT running"
    echo ""
    echo "Please start the Laravel backend first:"
    echo "  cd /home/irfan/tracksy/backend"
    echo "  php artisan serve"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Starting Student App..."
echo ""

# Start the app
npm run web

