#!/bin/bash

echo "========================================="
echo "🚀 Quick Invoice Test - Student App"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if servers are running
echo "Checking if servers are running..."

BACKEND_RUNNING=$(ps aux | grep -E "php.*serve.*8001" | grep -v grep | wc -l)
STUDENT_APP_RUNNING=$(ps aux | grep -E "vite.*19007" | grep -v grep | wc -l)

if [ $BACKEND_RUNNING -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Backend server not running${NC}"
    echo "Starting backend server..."
    cd backend
    php artisan serve --port=8001 > /tmp/backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
    cd ..
    sleep 3
else
    echo -e "${GREEN}✅ Backend server is running${NC}"
fi

if [ $STUDENT_APP_RUNNING -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Student app not running${NC}"
    echo "Starting student app..."
    cd studentapp
    npm run dev > /tmp/studentapp.log 2>&1 &
    STUDENT_APP_PID=$!
    echo -e "${GREEN}✅ Student app started (PID: $STUDENT_APP_PID)${NC}"
    cd ..
    sleep 5
else
    echo -e "${GREEN}✅ Student app is running${NC}"
fi

echo ""
echo "========================================="
echo -e "${BLUE}📱 Test Instructions${NC}"
echo "========================================="
echo ""
echo "1. Open your browser and go to:"
echo -e "   ${GREEN}http://localhost:19007${NC}"
echo ""
echo "2. Login with student credentials:"
echo "   - Email: (your student email)"
echo "   - Password: (your password)"
echo ""
echo "3. Navigate to Fees page"
echo ""
echo "4. Click 'Download Invoice' button on any fee"
echo ""
echo "5. The PDF should download and open successfully!"
echo ""
echo "========================================="
echo -e "${BLUE}🔧 Troubleshooting${NC}"
echo "========================================="
echo ""
echo "If invoice doesn't download:"
echo ""
echo "• Check browser console (F12) for errors"
echo "• Check backend logs:"
echo "  tail -f backend/storage/logs/laravel.log"
echo ""
echo "• Test API endpoint directly:"
echo "  curl -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "       http://localhost:8001/api/student/fees/5/invoice \\"
echo "       --output test.pdf"
echo ""
echo "• Run full test:"
echo "  ./test-pdf-generation.sh"
echo ""
echo "========================================="
echo "Logs available at:"
echo "  Backend: /tmp/backend.log"
echo "  Student App: /tmp/studentapp.log"
echo "========================================="





