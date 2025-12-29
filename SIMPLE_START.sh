#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  Starting Student & Driver Apps - SIMPLE VERSION"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Kill any existing
killall -9 node 2>/dev/null
sleep 2

# Start Backend first
cd /home/irfan/tracksy/backend
php artisan serve > /dev/null 2>&1 &
echo "✓ Backend starting..."
sleep 3

# Start Student App on port 3000
cd /home/irfan/tracksy/studentapp
PORT=3000 npm run dev &
echo "✓ Student app starting on port 3000..."
sleep 10

# Start Driver App on port 19008
cd /home/irfan/tracksy/driver-app
npm run web &
echo "✓ Driver app starting on port 19008..."
sleep 10

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Apps should be ready now!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Check:"
echo "  Student: http://localhost:3000"
echo "  Driver:  http://localhost:19008"
echo ""

