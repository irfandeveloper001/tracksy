#!/bin/bash
echo "Restarting Laravel backend..."
pkill -f "php artisan serve" 2>/dev/null || true
sleep 2
php artisan serve &
sleep 3
echo "✅ Backend restarted on http://localhost:8000"
