#!/bin/bash

echo "=========================================="
echo "   Tracksy - System Status Check"
echo "=========================================="
echo ""

# Check Laravel Backend
echo "1. Laravel Backend (http://localhost:8000/api)"
if curl -s http://localhost:8000/api > /dev/null 2>&1; then
    echo "   ✅ RUNNING"
    curl -s http://localhost:8000/api | head -1
else
    echo "   ❌ NOT RUNNING"
    echo "   Start with: cd /home/irfan/tracksy/backend && php artisan serve"
fi

echo ""

# Check Student App
echo "2. Student App (http://localhost:19007)"
if curl -s http://localhost:19007 > /dev/null 2>&1; then
    echo "   ✅ RUNNING"
else
    echo "   ❌ NOT RUNNING"  
    echo "   Start with: cd /home/irfan/tracksy/studentapp && npm run web"
fi

echo ""

# Check Driver App
echo "3. Driver App (http://localhost:19008)"
if curl -s http://localhost:19008 > /dev/null 2>&1; then
    echo "   ✅ RUNNING"
else
    echo "   ❌ NOT RUNNING"
    echo "   Start with: cd /home/irfan/tracksy/driver-app && npm run web"
fi

echo ""

# Check Admin Dashboard
echo "4. Admin Dashboard (http://localhost:19009)"
if curl -s http://localhost:19009 > /dev/null 2>&1; then
    echo "   ✅ RUNNING"
else
    echo "   ❌ NOT RUNNING"
    echo "   Start with: cd /home/irfan/tracksy/admin-dashboard && npm run dev"
fi

echo ""
echo "=========================================="
echo "Quick Actions:"
echo "=========================================="
echo "Test registration: http://localhost:19007/register"
echo "Test driver login: http://localhost:19008/login"
echo "Test admin login:  http://localhost:19009/login"
echo ""

