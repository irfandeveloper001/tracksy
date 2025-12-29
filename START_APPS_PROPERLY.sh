#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  Starting Student & Driver Apps on Correct Ports"
echo "════════════════════════════════════════════════════════════"
echo ""

# Function to check if port is in use
check_port() {
    if netstat -tuln 2>/dev/null | grep -q ":$1 "; then
        return 0
    else
        return 1
    fi
}

# Kill any existing processes
echo "Clearing existing processes..."
pkill -f "react-router" 2>/dev/null
pkill -f "vite" 2>/dev/null
fuser -k 19007/tcp 2>/dev/null
fuser -k 19008/tcp 2>/dev/null
fuser -k 19009/tcp 2>/dev/null
sleep 3
echo "✓ Processes cleared"
echo ""

# Start Student App on 19007
echo "Starting Student App on port 19007..."
cd /home/irfan/tracksy/studentapp
nohup npm run web > /tmp/student_app_19007.log 2>&1 &
STUDENT_PID=$!
echo "  PID: $STUDENT_PID"
sleep 5

# Check if student app started successfully
if check_port 19007; then
    echo "  ✅ Student App running on port 19007"
else
    echo "  ⚠️  Student App starting... (check logs: tail -f /tmp/student_app_19007.log)"
fi

echo ""

# Start Driver App on 19008
echo "Starting Driver App on port 19008..."
cd /home/irfan/tracksy/driver-app
nohup npm run web > /tmp/driver_app_19008.log 2>&1 &
DRIVER_PID=$!
echo "  PID: $DRIVER_PID"
sleep 5

# Check if driver app started successfully
if check_port 19008; then
    echo "  ✅ Driver App running on port 19008"
else
    echo "  ⚠️  Driver App starting... (check logs: tail -f /tmp/driver_app_19008.log)"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Waiting for apps to fully start..."
echo "════════════════════════════════════════════════════════════"
sleep 8

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  FINAL STATUS"
echo "════════════════════════════════════════════════════════════"
echo ""

# Final check
if curl -s http://localhost:19007 > /dev/null 2>&1; then
    echo "✅ Student App:  http://localhost:19007  [RUNNING]"
else
    echo "❌ Student App:  http://localhost:19007  [NOT RESPONDING]"
    echo "   Check logs: tail -20 /tmp/student_app_19007.log"
fi

if curl -s http://localhost:19008 > /dev/null 2>&1; then
    echo "✅ Driver App:   http://localhost:19008  [RUNNING]"
else
    echo "❌ Driver App:   http://localhost:19008  [NOT RESPONDING]"
    echo "   Check logs: tail -20 /tmp/driver_app_19008.log"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  HOW TO USE"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Student App:"
echo "  • URL: http://localhost:19007"
echo "  • Run individually: cd /home/irfan/tracksy/studentapp && npm run web"
echo ""
echo "Driver App:"
echo "  • URL: http://localhost:19008"
echo "  • Run individually: cd /home/irfan/tracksy/driver-app && npm run web"
echo ""
echo "To stop all:"
echo "  pkill -f 'react-router'"
echo ""
echo "════════════════════════════════════════════════════════════"

