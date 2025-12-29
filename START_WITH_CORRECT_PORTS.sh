#!/bin/bash

echo "══════════════════════════════════════════════════════════════"
echo "  Starting Apps on CORRECT Ports"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Kill everything first
echo "Stopping any running apps..."
pkill -f "react-router" 2>/dev/null
pkill -f "vite" 2>/dev/null
fuser -k 3000/tcp 2>/dev/null
fuser -k 19007/tcp 2>/dev/null
fuser -k 19008/tcp 2>/dev/null
fuser -k 19009/tcp 2>/dev/null
fuser -k 19010/tcp 2>/dev/null
sleep 3
echo "✓ Cleared"
echo ""

# Start Laravel Backend
echo "Starting Laravel Backend on port 8000..."
cd /home/irfan/tracksy/backend
nohup php artisan serve > /tmp/laravel.log 2>&1 &
sleep 2
echo "✓ Backend started"
echo ""

# Start Student App on port 3000 with 'npm run dev'
echo "Starting STUDENT APP on port 3000..."
cd /home/irfan/tracksy/studentapp
nohup npm run dev > /tmp/student_app_3000.log 2>&1 &
sleep 8
echo "✓ Student app starting..."
echo ""

# Start Driver App on port 19008
echo "Starting DRIVER APP on port 19008..."
cd /home/irfan/tracksy/driver-app
nohup npm run web > /tmp/driver_app_19008.log 2>&1 &
sleep 8
echo "✓ Driver app starting..."
echo ""

echo "Waiting for apps to fully start..."
sleep 10

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  VERIFICATION"
echo "══════════════════════════════════════════════════════════════"
echo ""

# Check Student App
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ STUDENT APP: http://localhost:3000"
    echo "   Command: cd /home/irfan/tracksy/studentapp && npm run dev"
    echo "   Shows: Student Portal with Sidebar"
else
    echo "⚠️  Student App not ready yet..."
    echo "   Check: tail -f /tmp/student_app_3000.log"
fi

echo ""

# Check Driver App
if curl -s http://localhost:19008 > /dev/null 2>&1; then
    echo "✅ DRIVER APP: http://localhost:19008"
    echo "   Command: cd /home/irfan/tracksy/driver-app && npm run web"
    echo "   Shows: Driver Dashboard"
else
    echo "⚠️  Driver App not ready yet..."
    echo "   Check: tail -f /tmp/driver_app_19008.log"
fi

echo ""

# Check Backend
if curl -s http://localhost:8000/api > /dev/null 2>&1; then
    echo "✅ BACKEND: http://localhost:8000"
else
    echo "⚠️  Backend not ready yet..."
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  HOW TO RUN INDIVIDUALLY"
echo "══════════════════════════════════════════════════════════════"
echo ""
echo "STUDENT APP (Port 3000):"
echo "  cd /home/irfan/tracksy/studentapp"
echo "  npm run dev"
echo ""
echo "DRIVER APP (Port 19008):"
echo "  cd /home/irfan/tracksy/driver-app"
echo "  npm run web"
echo ""
echo "══════════════════════════════════════════════════════════════"

