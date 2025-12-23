#!/bin/bash

echo "=========================================="
echo "Starting Student & Driver Apps"
echo "=========================================="
echo ""

# Start Student App on port 19007
echo "Starting Student App on port 19007..."
cd /home/irfan/tracksy/studentapp
nohup npm run web > /tmp/student_app_19007.log 2>&1 &
STUDENT_PID=$!
echo "Student App PID: $STUDENT_PID"

# Wait a bit
sleep 3

# Start Driver App on port 19008  
echo "Starting Driver App on port 19008..."
cd /home/irfan/tracksy/driver-app
nohup npm run web > /tmp/driver_app_19008.log 2>&1 &
DRIVER_PID=$!
echo "Driver App PID: $DRIVER_PID"

# Wait for them to start
echo ""
echo "Waiting for apps to start..."
sleep 8

echo ""
echo "=========================================="
echo "Status Check"
echo "=========================================="
echo ""

# Check Student App
if curl -s http://localhost:19007 > /dev/null 2>&1; then
    echo "✅ Student App: http://localhost:19007"
else
    echo "⚠️  Student App: Still starting... (check logs: tail /tmp/student_app_19007.log)"
fi

# Check Driver App
if curl -s http://localhost:19008 > /dev/null 2>&1; then
    echo "✅ Driver App: http://localhost:19008"
else
    echo "⚠️  Driver App: Still starting... (check logs: tail /tmp/driver_app_19008.log)"
fi

echo ""
echo "=========================================="
echo "Access Your Apps"
echo "=========================================="
echo ""
echo "Student App:  http://localhost:19007"
echo "Driver App:   http://localhost:19008"
echo "Laravel API:  http://localhost:8000"
echo ""
echo "=========================================="

